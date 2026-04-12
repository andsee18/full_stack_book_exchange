package com.bookexchange.backendjava.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;

@RestController
public class SitemapController {

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String getSitemap() {
        String baseUrl = "http://localhost:3000";
        String date = LocalDate.now().toString();
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" +
               "  <url>\n" +
               "    <loc>" + baseUrl + "/</loc>\n" +
               "    <lastmod>" + date + "</lastmod>\n" +
               "    <changefreq>daily</changefreq>\n" +
               "    <priority>1.0</priority>\n" +
               "  </url>\n" +
               "  <url>\n" +
               "    <loc>" + baseUrl + "/catalog</loc>\n" +
               "    <lastmod>" + date + "</lastmod>\n" +
               "    <changefreq>hourly</changefreq>\n" +
               "    <priority>0.8</priority>\n" +
               "  </url>\n" +
               "</urlset>";
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String getRobotsTxt() {
        return "User-agent: *\n" +
               "Disallow: /admin/\n" +
               "Disallow: /profile/\n" +
               "Disallow: /settings/\n" +
               "Allow: /\n" +
               "Sitemap: http://localhost:8080/sitemap.xml\n";
    }
}
