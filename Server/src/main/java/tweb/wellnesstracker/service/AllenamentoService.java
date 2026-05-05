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

    // Ritorna tutti gli allenamenti di un utente
    public List<LogAllenamento> getStoricoUtente(Long utenteId) {
        return logRepository.findByUtenteIdOrderByDataDesc(utenteId);
    }

    // Filtra lo storico tenendo solo gli ultimi 7 giorni
    public List<LogAllenamento> getUltimi7Giorni(Long utenteId) {
        LocalDate unaSettimanaFa = LocalDate.now().minusDays(7);
        return logRepository.findByUtenteIdOrderByDataDesc(utenteId).stream()
                .filter(l -> !l.getData().isBefore(unaSettimanaFa))
                .collect(Collectors.toList());
    }

    // Salva scheda di allenamento
    public SchedaAllenamento creaScheda(SchedaAllenamento scheda) {
        return schedaRepository.save(scheda);
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

    // Ritorna tutti i commenti di un allenamento
    public List<CommentoAllenamento> getCommentiLog(Long logId) {
        return commentoRepository.findByLogAllenamentoId(logId);
    }
}