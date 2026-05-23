package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    // Elimina una dieta
    @Transactional
    public void eliminaDieta(Long dietaId, Long utenteId) {
        Dieta dieta = dietaRepository.findById(dietaId).orElseThrow(() -> new IllegalArgumentException("Dieta non trovata: " + dietaId));

        // Verifica che la scheda appartenga all'utente che ha fatto la richiesta
        if (!dieta.getCoach().getId().equals(utenteId)) {
            throw new SecurityException("Non autorizzato a eliminare questa dieta");
        }

        // Elimina la dieta
        dietaRepository.deleteById(dietaId);
    }

}