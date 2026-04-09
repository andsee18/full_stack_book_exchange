package com.bookexchange.backendjava.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class GoogleBooksService {

    private final RestTemplate restTemplate;

    public GoogleBooksService() {
        this.restTemplate = new RestTemplate();
    }

    public List<Map<String, Object>> searchBooks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        // используем open library api так как у него нет жестких лимитов
        String url = UriComponentsBuilder.fromHttpUrl("https://openlibrary.org/search.json")
                .queryParam("q", query)
                .queryParam("limit", 5)
                .toUriString();

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("docs")) {
                List<Map<String, Object>> docs = (List<Map<String, Object>>) response.get("docs");
                // приводим формат к тому который ожидает фронт
                return docs.stream().map(doc -> {
                    java.util.Map<String, Object> item = new java.util.HashMap<>();
                    item.put("id", doc.get("key"));
                    java.util.Map<String, Object> volumeInfo = new java.util.HashMap<>();
                    volumeInfo.put("title", doc.get("title"));
                    volumeInfo.put("authors", doc.get("author_name"));
                    // open library не всегда дает описание в поиске сразу
                    volumeInfo.put("description", "Книга найдена в Open Library. Ключ: " + doc.get("key"));
                    item.put("volumeInfo", volumeInfo);
                    return item;
                }).collect(java.util.stream.Collectors.toList());
            }
        } catch (Exception e) {
            System.err.println("Error calling Open Library API: " + e.getMessage());
        }
        return Collections.emptyList();
    }
}
