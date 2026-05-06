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
    public ResponseEntity<LogAllenamento> salvaLog(@RequestBody LogAllenamento log, HttpServletRequest request) {
        Utente utenteLoggato = (Utente) request.getSession().getAttribute("utente");

        if (utenteLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.setUtente(utenteLoggato);
        return ResponseEntity.ok(allenamentoService.salvaAllenamento(log, List.of()));
    }

    // GET /api/allenamento/schedeUtente
    @GetMapping("/schedeUtente")
    public ResponseEntity<List<SchedaAllenamento>> getSchede(HttpServletRequest request) {
        Utente utenteLoggato = (Utente) request.getSession().getAttribute("utente");

        if (utenteLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(allenamentoService.getSchedeUtente(utenteLoggato.getId()));
    }

    // GET /api/allenamento/eseriziScheda/{schedaId}
    @GetMapping("/eseriziScheda/{schedaId}")
    public ResponseEntity<List<EsercizioScheda>> getEsercizi(@PathVariable Long schedaId) {
        return ResponseEntity.ok(allenamentoService.getEserciziByScheda(schedaId));
    }

    // GET /api/allenamento/commenti/{logId}
    @GetMapping("/commenti/{logId}")
    public ResponseEntity<List<CommentoAllenamento>> getCommenti(@PathVariable Long logId) {
        return ResponseEntity.ok(allenamentoService.getCommentiLog(logId));
    }

    // GET /api/allenamento/ultimi7?utenteId=1 — solo COACH
    @GetMapping("/ultimi7")
    public ResponseEntity<?> getUltimi7(@RequestParam Long utenteId, HttpServletRequest request) {
        Utente coachLoggato = (Utente) request.getSession().getAttribute("utente");

        if (coachLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"COACH".equals(coachLoggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso riservato ai COACH\"}");

        return ResponseEntity.ok(allenamentoService.getUltimi7Giorni(utenteId));
    }

    // GET /api/allenamento/schedeCoach — solo COACH
    @GetMapping("/schedeCoach")
    public ResponseEntity<?> getSchedeCoach(HttpServletRequest request) {
        Utente coachLoggato = (Utente) request.getSession().getAttribute("utente");

        if (coachLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"COACH".equals(coachLoggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso riservato ai COACH\"}");

        return ResponseEntity.ok(allenamentoService.getSchedeCoach(coachLoggato.getId()));
    }

    // POST /api/allenamento/nuovoEsercizioScheda — solo COACH
    @PostMapping("/nuovoEsercizioScheda")
    public ResponseEntity<?> creaEsercizioScheda(@RequestBody EsercizioScheda esercizio, HttpServletRequest request) {
        Utente coachLoggato = (Utente) request.getSession().getAttribute("utente");

        if (coachLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"COACH".equals(coachLoggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso riservato ai COACH\"}");

        // ?? dobbiamo settare la scheda allenamento oppure è già salvato in esercizio
        return ResponseEntity.ok(allenamentoService.salvaEsercizioScheda(esercizio));
    }

    // POST /api/allenamento/nuovaScheda — solo COACH
    @PostMapping("/nuovaScheda")
    public ResponseEntity<?> creaScheda(@RequestBody SchedaAllenamento scheda, HttpServletRequest request) {
        Utente coachLoggato = (Utente) request.getSession().getAttribute("utente");

        if (coachLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"COACH".equals(coachLoggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso riservato ai COACH\"}");

        scheda.setCoach(coachLoggato);
        return ResponseEntity.ok(allenamentoService.creaScheda(scheda));
    }

    // POST /api/allenamento/nuovoCommento — solo COACH
    @PostMapping("/nuovoCommento")
    public ResponseEntity<?> aggiungiCommento(@RequestBody CommentoAllenamento commento, HttpServletRequest request) {
        Utente coachLoggato = (Utente) request.getSession().getAttribute("utente");

        if (coachLoggato == null) {
            // non c'è una sessione
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"COACH".equals(coachLoggato.getRuolo()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"errore\": \"Accesso riservato ai COACH\"}");

        commento.setCoach(coachLoggato);
        return ResponseEntity.ok(allenamentoService.aggiungiCommento(commento));
    }
}