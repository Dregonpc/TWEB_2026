package tweb.wellnesstracker.controller;

import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tweb.wellnesstracker.persistence.Utente;
import tweb.wellnesstracker.service.UtenteService;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/session")
public class LoginController {

    @Autowired
    private UtenteService utenteService;

    // POST /session - login: verifica credenziali e crea la sessione
    @PostMapping
    public ResponseEntity<?> login(@RequestBody Map<String, String> body,
                                   HttpServletRequest request) {
        String username = body.get("username");
        String password = body.get("password");

        Optional<Utente> utente = utenteService.login(username, password);
        if (utente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"errore\": \"Credenziali errate\"}");
        }

        // invalida sessione precedente prima di crearne una nuova
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) oldSession.invalidate();

        // Crea la sessione e salva l'utente - genera il cookie LABSESSIONCOOKIE
        HttpSession session = request.getSession(true);
        session.setAttribute("utente", utente.get());
        return ResponseEntity.ok(utente.get());
    }

    // DELETE /session - logout
    @DeleteMapping
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response)
    {
        HttpSession session = request.getSession(false);

        if (session != null) session.invalidate();

        // cancella il cookie LABSESSIONCOOKIE nel browser
        Cookie cookie = new Cookie("LABSESSIONCOOKIE", "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        return ResponseEntity.ok("{\"messaggio\": \"Logout effettuato\"}");
    }

    // GET /session - restituisce l'utente loggato (usato da React al caricamento)
    @GetMapping
    public ResponseEntity<?> me(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("utente") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"errore\": \"Nessun utente loggato\"}");
        }
        return ResponseEntity.ok(session.getAttribute("utente"));
    }
}