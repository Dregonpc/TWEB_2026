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

    // GET /api/utenti/atleti — lista utenti USER, accessibile a COACH e PSICOLOGO
    @GetMapping("/atleti")
    public ResponseEntity<?> getAtleti(HttpServletRequest request) {
        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"COACH".equals(loggato.getRuolo()) && !"PSICOLOGO".equals(loggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso non consentito\"}");

        return ResponseEntity.ok(utenteService.getAtletiPerRuolo("USER"));
    }

    // GET /api/utenti/profilo/{username}
    @GetMapping("/profilo/{username}")
    public ResponseEntity<?> getProfilo(@PathVariable String username) {
        Utente u = utenteService.getUtenteByUsername(username);
        if (u == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"errore\": \"Utente non trovato\"}");

        return ResponseEntity.ok(u);
    }
}