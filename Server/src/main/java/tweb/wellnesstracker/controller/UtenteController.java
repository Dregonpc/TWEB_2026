package tweb.wellnesstracker.controller;

import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tweb.wellnesstracker.persistence.Utente;
import tweb.wellnesstracker.service.UtenteService;

import java.util.List;

@RestController
@RequestMapping("/api/utenti")
public class UtenteController {

    @Autowired
    private UtenteService utenteService;

    // GET /api/utenti/listaUtenti — lista utenti USER, accessibile a COACH e PSICOLOGO
    @GetMapping("/listaUtenti")
    public ResponseEntity<?> getUtenti(HttpServletRequest request) {
        Utente loggato = (Utente) request.getSession().getAttribute("utente");

        if (loggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"COACH".equals(loggato.getRuolo()) && !"PSICOLOGO".equals(loggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso non consentito\"}");

        return ResponseEntity.ok(utenteService.getUtentiPerRuolo("USER"));
    }

    // GET /api/utenti/profilo/{username}
    @GetMapping("/profilo/{username}")
    public ResponseEntity<?> getProfilo(@PathVariable String username) {
        Utente user = utenteService.getUtenteByUsername(username);
        if (user == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"errore\": \"Utente non trovato\"}");

        return ResponseEntity.ok(user);
    }
}