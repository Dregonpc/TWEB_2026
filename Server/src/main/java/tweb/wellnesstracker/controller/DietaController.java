package tweb.wellnesstracker.server.controller;

import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tweb.wellnesstracker.persistence.*;
import tweb.wellnesstracker.service.DietaService;

import java.util.List;

@RestController
@RequestMapping("/api/dieta")
public class DietaController {

    @Autowired
    private DietaService dietaService;

    // GET /api/dieta/utente/{utenteId}
    // Recupera tutte le diete assegnate a un utente
    @GetMapping("/utente/{utenteId}")
    public ResponseEntity<List<Dieta>> getDieteUtente(@PathVariable Long utenteId) {
        return ResponseEntity.ok(dietaService.getDieteUtente(utenteId));
    }

    // POST /api/dieta
    // Il coach crea una nuova dieta per un atleta
    @PostMapping
    public ResponseEntity<?> creaDieta(
            @RequestBody Dieta dieta,
            HttpServletRequest request) {

        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"COACH".equals(loggato.getRuolo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso riservato ai COACH\"}");
        }
        dieta.setCoach(loggato);
        return ResponseEntity.ok(dietaService.creaDieta(dieta));
    }
}