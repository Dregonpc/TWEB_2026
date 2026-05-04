package tweb.wellnesstracker.controller;

import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tweb.wellnesstracker.persistence.*;
import tweb.wellnesstracker.service.AllenamentoService;

import java.util.List;

@RestController
@RequestMapping("/api/allenamento")
public class AllenamentoController {

    @Autowired
    private AllenamentoService allenamentoService;

    // GET /api/allenamento/storico
    @GetMapping("/storico")
    public ResponseEntity<List<LogAllenamento>> getStorico(HttpServletRequest request) {
        // Recuperiamo l'utente che il LoginController ha salvato in sessione
        Utente utenteLoggato = (Utente) request.getSession().getAttribute("utente");

        if (utenteLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<LogAllenamento> storico = allenamentoService.getStoricoUtente(utenteLoggato.getId());
        return ResponseEntity.ok(storico);
    }

    // POST /api/allenamento/log — salva un nuovo log, associandolo all'utente in sessione
    @PostMapping("/log")
    public ResponseEntity<LogAllenamento> salvaLog(@RequestBody LogAllenamento log,
                                                   HttpServletRequest request) {
        Utente utente = (Utente) request.getSession().getAttribute("utente");
        log.setUtente(utente);
        return ResponseEntity.ok(allenamentoService.salvaAllenamento(log, List.of()));
    }

    // GET /api/allenamento/ultimi7?utenteId=1 — solo COACH
    @GetMapping("/ultimi7")
    public ResponseEntity<?> getUltimi7(@RequestParam Long utenteId,
                                        HttpServletRequest request) {
        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"COACH".equals(loggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso riservato ai COACH\"}");

        return ResponseEntity.ok(allenamentoService.getUltimi7Giorni(utenteId));
    }

    // GET /api/allenamento/schede
    @GetMapping("/schede")
    public ResponseEntity<List<SchedaAllenamento>> getSchede(HttpServletRequest request) {
        // Recuperiamo l'utente che il LoginController ha salvato in sessione
        Utente utenteLoggato = (Utente) request.getSession().getAttribute("utente");

        if (utenteLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(allenamentoService.getSchedeUtente(utenteLoggato.getId()));
    }

    // POST /api/allenamento/scheda — solo COACH
    @PostMapping("/scheda")
    public ResponseEntity<?> creaScheda(@RequestBody SchedaAllenamento scheda,
                                        HttpServletRequest request) {
        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"COACH".equals(loggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso riservato ai COACH\"}");

        scheda.setCoach(loggato);
        return ResponseEntity.ok(allenamentoService.creaScheda(scheda));
    }

    // POST /api/allenamento/commento — solo COACH
    @PostMapping("/commento")
    public ResponseEntity<?> aggiungiCommento(@RequestBody CommentoAllenamento commento,
                                              HttpServletRequest request) {
        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"COACH".equals(loggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso riservato ai COACH\"}");

        commento.setCoach(loggato);
        return ResponseEntity.ok(allenamentoService.aggiungiCommento(commento));
    }

    // GET /api/allenamento/commenti/{logId}
    @GetMapping("/commenti/{logId}")
    public ResponseEntity<List<CommentoAllenamento>> getCommenti(@PathVariable Long logId) {
        return ResponseEntity.ok(allenamentoService.getCommentiLog(logId));
    }
}