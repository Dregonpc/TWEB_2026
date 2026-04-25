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

    // POST /session — login: verifica credenziali e crea la sessione
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

        // Crea la sessione e salva l'utente — genera il cookie JSESSIONID
        HttpSession session = request.getSession(true);
        session.setAttribute("utente", utente.get());
        return ResponseEntity.ok(utente.get());
    }

    // DELETE /session — logout: invalida la sessione
    @DeleteMapping
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // getSession(false): non crea una nuova sessione se non esiste
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.ok("{\"messaggio\": \"Logout effettuato\"}");
    }

    // GET /session — restituisce l'utente loggato (usato da React al caricamento)
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