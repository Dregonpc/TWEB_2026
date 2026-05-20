package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tweb.wellnesstracker.persistence.Dieta;
import tweb.wellnesstracker.repository.DietaRepository;

import java.util.List;

@Service
public class DietaService {

    @Autowired
    private DietaRepository dietaRepository;

    // Salva un dieta
    public Dieta creaDieta(Dieta dieta) {
        return dietaRepository.save(dieta);
    }

    // Ritorna tutte le diete di un utente
    public List<Dieta> getDieteUtente(Long utenteId) {
        return dietaRepository.findByUtenteId(utenteId);
    }

    // Ritorna tutte le diete di un coach
    public List<Dieta> getDieteCoach(Long coachId) {
        return dietaRepository.findByCoachId(coachId);
    }
}