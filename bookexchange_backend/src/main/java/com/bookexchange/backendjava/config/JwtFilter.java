package com.bookexchange.backendjava.config;

import com.bookexchange.backendjava.security.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
// удалено
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.http.HttpMethod; 
import io.jsonwebtoken.ExpiredJwtException; 
import java.io.IOException;
import java.util.Optional;

// аннотация удалена или
public class JwtFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService; 

    // конструктор важный ключевой
    public JwtFilter(JwtTokenUtil jwtTokenUtil, UserDetailsService userDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    // комментарий важный ключевой
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // маршруты аутентификации регистрации
        if (path.startsWith("/api/auth") || path.equals("/api/users")) {
            System.out.println("DEBUG JWT: IGNORING filter for public AUTH path: " + path);
            return true;
        }

        // маршруты каталога важный
        if (method.equals(HttpMethod.GET.toString()) && path.startsWith("/api/books")) {
            System.out.println("DEBUG JWT: IGNORING filter for public GET books: " + path);
            return true;
        }

        // публичный профиль пользователя
        if (method.equals(HttpMethod.GET.toString()) && path.matches("^/api/users/\\d+$")) {
            System.out.println("DEBUG JWT: IGNORING filter for public GET user by id: " + path);
            return true;
        }
        
        // предварительные запросы важный
        if (method.equals(HttpMethod.OPTIONS.toString())) {
            System.out.println("DEBUG JWT: IGNORING filter for OPTIONS request: " + path);
            return true;
        }
        
        System.out.println("DEBUG JWT: APPLYING filter to protected path: " + path);
        return false; // Применять фильтр ко всем остальным маршрутам
    }
    // комментарий важный ключевой


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // остальной код без
        final String authorizationHeader = request.getHeader("Authorization");
        Long userId = null; 
        String jwt = null;

        // проверка заголовка важный
        if (Optional.ofNullable(authorizationHeader).isPresent() && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            
            try {
                userId = jwtTokenUtil.getUserIdFromToken(jwt); 
                System.out.println("DEBUG: Token valid, extracted user ID: " + userId);
            } catch (ExpiredJwtException e) {
                 System.out.println("DEBUG: Token expired. Spring will handle 401: " + e.getMessage());
            } catch (Exception e) {
                 System.out.println("DEBUG: Token error. Spring will handle 401: " + e.getMessage());
            }
        }

        // установка контекста безопасности
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(String.valueOf(userId)); 

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        String.valueOf(userId), 
                        null, 
                        userDetails.getAuthorities());
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("DEBUG: Context set for user: " + userId);

            } catch (UsernameNotFoundException e) {
                System.out.println("DEBUG: User from token not found in DB.");
            }
        }
        
        filterChain.doFilter(request, response);
    }
}