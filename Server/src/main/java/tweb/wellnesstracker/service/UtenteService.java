package tweb.wellnesstracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tweb.wellnesstracker.persistence.Utente;
import tweb.wellnesstracker.repository.UtenteRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UtenteService {

    @Autowired
    private UtenteRepository utenteRepository;

    // Tentativo di login
    public Optional<Utente> login(String username, String password) {
        return utenteRepository.findByUsername(username).filter(u -> u.getPassword().equals(password));
    }

    // Ritorna l'utente in base allo username
    public Utente getUtenteByUsername(String username) {
        return utenteRepository.findByUsername(username).orElse(null);
    }

    // Ritorna gli utenti con lo stesso ruolo (passato come parametro)
    public List<Utente> getUtentiPerRuolo(String ruoloUtente) {
        return utenteRepository.findByRuolo(ruoloUtente);
    }
}