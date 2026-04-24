package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tweb.wellnesstracker.persistence.*;
import tweb.wellnesstracker.repository.*;

import java.util.List;

@Service
public class BenessereService {

    // --- Dependency injection ---
    @Autowired
    private LogBenessereRepository benessereRepository;

    @Autowired
    private CommentoBenessereRepository commentoRepository;

    public LogBenessere salvaLogBenessere(LogBenessere log) {
        return benessereRepository.save(log);
    }

    public List<LogBenessere> getStoricoBenessere(Long utenteId) {
        return benessereRepository.findByUtenteIdOrderByDataDesc(utenteId);
    }

    public CommentoBenessere aggiungiCommentoPsicologo(CommentoBenessere commento) {
        return commentoRepository.save(commento);
    }
}