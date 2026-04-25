package tweb.wellnesstracker.controller;

import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tweb.wellnesstracker.persistence.*;
import tweb.wellnesstracker.service.BenessereService;

import java.util.List;

@RestController
@RequestMapping("/api/benessere")
public class BenessereController {

    @Autowired
    private BenessereService benessereService;

    // GET /api/benessere/storico?utenteId=1
    @GetMapping("/storico")
    public ResponseEntity<List<LogBenessere>> getStorico(@RequestParam Long utenteId) {
        return ResponseEntity.ok(benessereService.getStoricoBenessere(utenteId));
    }

    // POST /api/benessere/log — salva un nuovo log, associandolo all'utente in sessione
    @PostMapping("/log")
    public ResponseEntity<LogBenessere> salvaLog(@RequestBody LogBenessere log,
                                                 HttpServletRequest request) {
        Utente utente = (Utente) request.getSession().getAttribute("utente");
        log.setUtente(utente);
        return ResponseEntity.ok(benessereService.salvaLogBenessere(log));
    }

    // POST /api/benessere/commento — solo PSICOLOGO
    @PostMapping("/commento")
    public ResponseEntity<?> aggiungiCommento(@RequestBody CommentoBenessere commento,
                                              HttpServletRequest request) {
        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"PSICOLOGO".equals(loggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso riservato agli PSICOLOGO\"}");

        commento.setPsicologo(loggato);
        return ResponseEntity.ok(benessereService.aggiungiCommentoPsicologo(commento));
    }

    // GET /api/benessere/commenti/{logId}
    @GetMapping("/commenti/{logId}")
    public ResponseEntity<List<CommentoBenessere>> getCommenti(@PathVariable Long logId) {
        return ResponseEntity.ok(benessereService.getCommentiLog(logId));
    }
}