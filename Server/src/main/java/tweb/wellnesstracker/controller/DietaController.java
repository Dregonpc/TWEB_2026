package tweb.wellnesstracker.controller;

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

    // GET /api/dieta/utente
    @GetMapping("/utente")
    public ResponseEntity<List<Dieta>> getDieteUtente(HttpServletRequest request) {
        Utente utenteLoggato = (Utente) request.getSession().getAttribute("utente");

        if (utenteLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(dietaService.getDieteUtente(utenteLoggato.getId()));
    }

    // GET /api/dieta/coach
    @GetMapping("/coach")
    public ResponseEntity<?> getDieteCoach(HttpServletRequest request) {
        Utente coachLoggato = (Utente) request.getSession().getAttribute("utente");

        if (coachLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"COACH".equals(coachLoggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso riservato ai COACH\"}");

        return ResponseEntity.ok(dietaService.getDieteCoach(coachLoggato.getId()));
    }

    // POST /api/dieta/aggiungiDieta — solo COACH
    @PostMapping("/aggiungiDieta")
    public ResponseEntity<?> creaDieta(@RequestBody Dieta dieta, HttpServletRequest request) {
        Utente coachLoggato = (Utente) request.getSession().getAttribute("utente");

        if (coachLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"COACH".equals(coachLoggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso riservato ai COACH\"}");

        dieta.setCoach(coachLoggato);
        return ResponseEntity.ok(dietaService.creaDieta(dieta));
    }

    // DELETE /api/dieta/eliminaDieta/{dietaId} — elimina una dieta
    @DeleteMapping("/eliminaDieta/{dietaId}")
    public ResponseEntity<?> eliminaDieta(@PathVariable Long dietaId, HttpServletRequest request) {
        Utente utenteLoggato = (Utente) request.getSession().getAttribute("utente");

        if (utenteLoggato == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            dietaService.eliminaDieta(dietaId, utenteLoggato.getId());
            return ResponseEntity.noContent().build(); // 204
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"errore\": \"Dieta non trovata\"}");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Non puoi eliminare questa dieta\"}");
        }
    }

}