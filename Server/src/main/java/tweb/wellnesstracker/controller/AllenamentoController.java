package tweb.wellnesstracker.server.controller;

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

    // GET /api/allenamento/storico?utenteId=1
    // Restituisce tutti i log di allenamento di un utente
    @GetMapping("/storico")
    public ResponseEntity<List<LogAllenamento>> getStorico(@RequestParam Long utenteId) {
        return ResponseEntity.ok(allenamentoService.getStoricoUtente(utenteId));
    }

    // POST /api/allenamento/log
    // L'utente salva un nuovo allenamento con i suoi esercizi
    @PostMapping("/log")
    public ResponseEntity<LogAllenamento> salvaLog(
            @RequestBody LogAllenamento log,
            HttpServletRequest request) {

        Utente utente = (Utente) request.getSession().getAttribute("utente");
        log.setUtente(utente);
        return ResponseEntity.ok(allenamentoService.salvaAllenamento(log, log.getEsercizi()));
    }

    // GET /api/allenamento/ultimi7?utenteId=1
    // Il coach vede gli allenamenti degli ultimi 7 giorni di un atleta
    @GetMapping("/ultimi7")
    public ResponseEntity<?> getUltimi7(
            @RequestParam Long utenteId,
            HttpServletRequest request) {

        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"COACH".equals(loggato.getRuolo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso riservato ai COACH\"}");
        }
        return ResponseEntity.ok(allenamentoService.getUltimi7Giorni(utenteId));
    }

    // GET /api/allenamento/schede/{utenteId}
    // Recupera le schede di allenamento assegnate a un utente
    @GetMapping("/schede/{utenteId}")
    public ResponseEntity<List<SchedaAllenamento>> getSchede(@PathVariable Long utenteId) {
        return ResponseEntity.ok(allenamentoService.getSchedeUtente(utenteId));
    }

    // POST /api/allenamento/scheda
    // Il coach crea una nuova scheda di allenamento per un atleta
    @PostMapping("/scheda")
    public ResponseEntity<?> creaScheda(
            @RequestBody SchedaAllenamento scheda,
            HttpServletRequest request) {

        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"COACH".equals(loggato.getRuolo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso riservato ai COACH\"}");
        }
        scheda.setCoach(loggato);
        return ResponseEntity.ok(allenamentoService.creaScheda(scheda));
    }

    // POST /api/allenamento/commento
    // Il coach lascia un commento su un log di allenamento
    @PostMapping("/commento")
    public ResponseEntity<?> aggiungiCommento(
            @RequestBody CommentoAllenamento commento,
            HttpServletRequest request) {

        Utente loggato = (Utente) request.getSession().getAttribute("utente");
        if (!"COACH".equals(loggato.getRuolo())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"errore\": \"Accesso riservato ai COACH\"}");
        }
        commento.setCoach(loggato);
        return ResponseEntity.ok(allenamentoService.aggiungiCommento(commento));
    }

    // GET /api/allenamento/commenti/{logId}
    // Recupera i commenti del coach su un log specifico
    @GetMapping("/commenti/{logId}")
    public ResponseEntity<List<CommentoAllenamento>> getCommenti(@PathVariable Long logId) {
        return ResponseEntity.ok(allenamentoService.getCommentiLog(logId));
    }
}