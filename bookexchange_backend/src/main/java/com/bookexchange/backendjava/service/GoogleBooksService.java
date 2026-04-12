package com.bookexchange.backendjava.service;

import org.springframework.stereotype.Service;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class GoogleBooksService {

    private final RestTemplate restTemplate;

    public GoogleBooksService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000); // 3 seconds timeout
        factory.setReadTimeout(5000); // 5 seconds timeout
        this.restTemplate = new RestTemplate(factory);
    }

    public List<Map<String, Object>> searchBooks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String url = UriComponentsBuilder.fromHttpUrl("https://openlibrary.org/search.json")
                .queryParam("q", query)
                .queryParam("limit", 5)
                .toUriString();

        int retries = 3;
        while (retries > 0) {
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
                break; // If successful, exit loop
            } catch (Exception e) {
                retries--;
                System.err.println("Error calling Open Library API, retries left: " + retries + " - " + e.getMessage());
                if (retries == 0) {
                    break;
                }
                try {
                    Thread.sleep(1000); // Add a small delay between retries
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return Collections.emptyList();
    }
}
