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
    private CommentoAllenamentoRepository commentoRepository;

    // Salva il log e i relativi esercizi in una singola transazione
    @Transactional
    public LogAllenamento salvaAllenamento(LogAllenamento log, List<EsercizioSvolto> esercizi) {
        LogAllenamento salvato = logRepository.save(log);
        for (EsercizioSvolto es : esercizi) {
            es.setLogAllenamento(salvato);
            esercizioRepository.save(es);
        }
        return salvato;
    }

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

    public SchedaAllenamento creaScheda(SchedaAllenamento scheda) {
        return schedaRepository.save(scheda);
    }

    public CommentoAllenamento aggiungiCommento(CommentoAllenamento commento) {
        return commentoRepository.save(commento);
    }

    // Metodi usati dai controller
    public List<SchedaAllenamento> getSchedeUtente(Long utenteId) {
        return schedaRepository.findByUtenteId(utenteId);
    }

    public List<CommentoAllenamento> getCommentiLog(Long logId) {
        return commentoRepository.findByLogAllenamentoId(logId);
    }
}