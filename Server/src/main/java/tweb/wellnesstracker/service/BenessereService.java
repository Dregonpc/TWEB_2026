package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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

    // Ritorna tutto lo storico del benessere di un utente
    public List<LogBenessere> getStoricoBenessere(Long utenteId) {
        return benessereRepository.findByUtenteIdOrderByDataDesc(utenteId);
    }

    // Salva il commento dello psicologo
    public CommentoBenessere aggiungiCommentoPsicologo(CommentoBenessere commento) {
        return commentoRepository.save(commento);
    }

    // Ritorna tutti i commenti di un determinato log
    public List<CommentoBenessere> getCommentiLog(Long logId) {
        return commentoRepository.findByLogBenessereId(logId);
    }
}