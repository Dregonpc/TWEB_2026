package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tweb.wellnesstracker.persistence.*;
import tweb.wellnesstracker.repository.*;

import java.util.List;

@Service
public class BenessereService {

    @Autowired
    private LogBenessereRepository benessereRepository;

    @Autowired
    private CommentoBenessereRepository commentoRepository;

    // Salva il benessere di un utente
    public LogBenessere salvaLogBenessere(LogBenessere log) {
        return benessereRepository.save(log);
    }

    // Elimina un log benessere (prima rimuove i commenti, poi il log)
    @Transactional
    public void eliminaLog(Long logId, Long utenteId) {
        LogBenessere log = benessereRepository.findById(logId).orElseThrow(() -> new IllegalArgumentException("Log non trovato: " + logId));

        // Verifica che il log appartenga all'utente che ha fatto la richiesta
        if (!log.getUtente().getId().equals(utenteId)) {
            throw new SecurityException("Non autorizzato a eliminare questo log");
        }

        // Prima elimina i commenti (evita violazioni FK)
        commentoRepository.deleteByLogBenessereId(logId);

        // Poi elimina il log
        benessereRepository.deleteById(logId);
    }


    // Ritorna tutto lo storico del benessere di un utente
    public List<LogBenessere> getStoricoBenessere(Long utenteId) {
        return benessereRepository.findByUtenteIdOrderByDataDesc(utenteId);
    }

    // Salva il commento dello psicologo
    public CommentoBenessere aggiungiCommentoPsicologo(CommentoBenessere commento) {
        return commentoRepository.save(commento);
    }

    // Elimina un commento
    @Transactional
    public void eliminaCommento(Long commentoId, Long utenteId) {
        CommentoBenessere commento = commentoRepository.findById(commentoId).orElseThrow(() -> new IllegalArgumentException("Commento non trovato: " + commentoId));

        // Verifica che il commento appartenga all'utente che ha fatto la richiesta
        if (!commento.getPsicologo().getId().equals(utenteId)) {
            throw new SecurityException("Non autorizzato a eliminare questo commento");
        }

        // Elimina il commento
        commentoRepository.deleteById(commentoId);
    }

    // Ritorna tutti i commenti di un determinato log
    public List<CommentoBenessere> getCommentiLog(Long logId) {
        return commentoRepository.findByLogBenessereId(logId);
    }
}