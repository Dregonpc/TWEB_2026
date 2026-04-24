package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tweb.wellnesstracker.persistence.Dieta;
import tweb.wellnesstracker.repository.DietaRepository;

import java.util.List;

@Service
public class DietaService {

    // --- Dependency injection ---
    @Autowired
    private DietaRepository dietaRepository;

    public Dieta creaDieta(Dieta dieta) {
        return dietaRepository.save(dieta);
    }

    public List<Dieta> getDieteUtente(Long utenteId) {
        return dietaRepository.findByUtenteId(utenteId);
    }
}