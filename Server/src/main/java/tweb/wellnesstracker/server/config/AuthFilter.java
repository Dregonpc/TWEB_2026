package tweb.wellnesstracker.server.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1)
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {

        HttpServletRequest request   = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // Lascia passare le preflight OPTIONS (necessario per CORS)
        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        // Lascia passare tutto ciò che riguarda /session (login, logout, me)
        String pathname = request.getServletPath();
        if (pathname.startsWith("/session")) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        // Controlla che ci sia un utente loggato nella sessione
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("utente") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"errore\": \"Non autorizzato\"}");
            return;
        }

        // Tutto ok, passa la richiesta al controller
        filterChain.doFilter(servletRequest, servletResponse);
    }
}