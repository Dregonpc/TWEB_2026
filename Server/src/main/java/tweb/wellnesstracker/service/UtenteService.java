package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tweb.wellnesstracker.persistence.Utente;
import tweb.wellnesstracker.repository.UtenteRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UtenteService {

    // --- Dependency injection ---
    @Autowired
    private UtenteRepository utenteRepository;

    public Optional<Utente> login(String username, String password) {
        return utenteRepository.findByUsername(username)
                .filter(u -> u.getPassword().equals(password));
    }

    public Utente getUtenteByUsername(String username) {
        return utenteRepository.findByUsername(username).orElse(null);
    }

    public List<Utente> getAtletiPerRuolo(String ruoloAtleta) {
        return utenteRepository.findByRuolo(ruoloAtleta);
    }
}