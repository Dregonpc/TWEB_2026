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
    public ResponseEntity<LogBenessere> salvaLog(@RequestBody LogBenessere log, HttpServletRequest request) {
        Utente utenteLoggato = (Utente) request.getSession().getAttribute("utente");

        if (utenteLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.setUtente(utenteLoggato);
        return ResponseEntity.ok(benessereService.salvaLogBenessere(log));
    }

    // DELETE /api/benessere/log/{logId} — elimina un log dell'utente loggato
    @DeleteMapping("/log/{logId}")
    public ResponseEntity<?> eliminaLog(@PathVariable Long logId, HttpServletRequest request) {
        Utente utenteLoggato = (Utente) request.getSession().getAttribute("utente");

        if (utenteLoggato == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            benessereService.eliminaLog(logId, utenteLoggato.getId());
            return ResponseEntity.noContent().build(); // 204
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"errore\": \"Log non trovato\"}");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Non puoi eliminare questo log\"}");
        }
    }


    // POST /api/benessere/commento — solo PSICOLOGO
    @PostMapping("/commento")
    public ResponseEntity<?> aggiungiCommento(@RequestBody CommentoBenessere commento, HttpServletRequest request) {
        Utente psicologoLoggato = (Utente) request.getSession().getAttribute("utente");

        if (psicologoLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"PSICOLOGO".equals(psicologoLoggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso riservato agli PSICOLOGO\"}");

        commento.setPsicologo(psicologoLoggato);
        return ResponseEntity.ok(benessereService.aggiungiCommentoPsicologo(commento));
    }

    // GET /api/benessere/commenti/{logId}
    @GetMapping("/commenti/{logId}")
    public ResponseEntity<List<CommentoBenessere>> getCommenti(@PathVariable Long logId) {
        return ResponseEntity.ok(benessereService.getCommentiLog(logId));
    }
}