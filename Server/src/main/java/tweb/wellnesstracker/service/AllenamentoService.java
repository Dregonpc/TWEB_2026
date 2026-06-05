package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tweb.wellnesstracker.persistence.*;
import tweb.wellnesstracker.repository.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AllenamentoService {

    @Autowired
    private LogAllenamentoRepository logRepository;

    @Autowired
    private EsercizioSvoltoRepository esercizioRepository;

    @Autowired
    private SchedaAllenamentoRepository schedaRepository;

    @Autowired
    private EsercizioSchedaRepository esercizioSchedaRepository;

    @Autowired
    private CommentoAllenamentoRepository commentoRepository;

    // Salva l'allenamento di un utente
    @Transactional
    public LogAllenamento salvaAllenamento(LogAllenamento log, List<EsercizioSvolto> esercizi) {
        LogAllenamento salvato = logRepository.save(log);
        for (EsercizioSvolto es : esercizi) {
            es.setLogAllenamento(salvato);
            esercizioRepository.save(es);
        }
        return salvato;
    }

    // Salva l'esrcizio di un allenamento di un utente
    public EsercizioSvolto salvaEsercizioSvolto(EsercizioSvolto esercizio) {
        return esercizioRepository.save(esercizio);
    }

    // Elimina un log allenamento (prima rimuove gli esercizi svolti, poi il log)
    @Transactional
    public void eliminaLog(Long logId, Long utenteId) {
        LogAllenamento log = logRepository.findById(logId).orElseThrow(() -> new IllegalArgumentException("Log non trovato: " + logId));

        // Verifica che il log appartenga all'utente che ha fatto la richiesta
        if (!log.getUtente().getId().equals(utenteId)) {
            throw new SecurityException("Non autorizzato a eliminare questo log");
        }

        // Prima elimina gli esercizi svolti collegati e commenti (evita violazioni FK)
        commentoRepository.deleteByLogAllenamentoId(logId);
        esercizioRepository.deleteByLogAllenamentoId(logId);

        // Poi elimina il log
        logRepository.deleteById(logId);
    }

    // Ritorna tutti gli allenamenti di un utente
    public List<LogAllenamento> getStoricoUtente(Long utenteId) {
        return logRepository.findByUtenteIdOrderByDataDesc(utenteId);
    }

    // Ritorna tutti gli esercizi di un allenamento
    public List<EsercizioSvolto> getEserciziLog(Long logId) {
        return esercizioRepository.findByLogAllenamentoId(logId);
    }

    // Filtra lo storico tenendo solo gli ultimi 7 giorni
    public List<LogAllenamento> getUltimi7Giorni(Long utenteId) {
        LocalDate unaSettimanaFa = LocalDate.now().minusDays(7);
        return logRepository.findByUtenteIdOrderByDataDesc(utenteId).stream()
                .filter(l -> !l.getData().isBefore(unaSettimanaFa))
                .collect(Collectors.toList());
    }

    // Salva scheda allenamento
    public SchedaAllenamento creaScheda(SchedaAllenamento scheda) {
        return schedaRepository.save(scheda);
    }

    // Elimina una scheda
    @Transactional
    public void eliminaScheda(Long schedaId, Long utenteId) {
        SchedaAllenamento scheda = schedaRepository.findById(schedaId).orElseThrow(() -> new IllegalArgumentException("Scheda non trovata: " + schedaId));

        // Verifica che la scheda appartenga all'utente che ha fatto la richiesta
        if (!scheda.getCoach().getId().equals(utenteId)) {
            throw new SecurityException("Non autorizzato a eliminare questa scheda");
        }

        // Prima elimina gli esercizi collegati (evita violazioni FK)
        esercizioSchedaRepository.deleteBySchedaAllenamentoId(schedaId);

        // Poi elimina il log
        schedaRepository.deleteById(schedaId);
    }


    // Ritorna tutte le schede di un utente
    public List<SchedaAllenamento> getSchedeUtente(Long utenteId) {
        return schedaRepository.findByUtenteId(utenteId);
    }

    // Ritorna tutte le schede che ha creato un coach
    public List<SchedaAllenamento> getSchedeCoach(Long coachId) {
        return schedaRepository.findByCoachId(coachId);
    }

    // Salva un esercizio per una scheda
    public EsercizioScheda salvaEsercizioScheda(EsercizioScheda e) {
        return esercizioSchedaRepository.save(e);
    }

    // Ritorna l'elenco degli esercizi di una scheda
    public List<EsercizioScheda> getEserciziByScheda(Long schedaId) {
        return esercizioSchedaRepository.findBySchedaAllenamentoId(schedaId);
    }

    // Salva un commento per un allenamento
    public CommentoAllenamento aggiungiCommento(CommentoAllenamento commento) {
        return commentoRepository.save(commento);
    }

    // Elimina un commento
    @Transactional
    public void eliminaCommento(Long commentoId, Long utenteId) {
        CommentoAllenamento commento = commentoRepository.findById(commentoId).orElseThrow(() -> new IllegalArgumentException("Commento non trovato: " + commentoId));

        // Verifica che il commento appartenga all'utente che ha fatto la richiesta
        if (!commento.getCoach().getId().equals(utenteId)) {
            throw new SecurityException("Non autorizzato a eliminare questo commento");
        }

        // Elimina il commento
        commentoRepository.deleteById(commentoId);
    }


    // Ritorna tutti i commenti di un allenamento
    public List<CommentoAllenamento> getCommentiLog(Long logId) {
        return commentoRepository.findByLogAllenamentoId(logId);
    }
}