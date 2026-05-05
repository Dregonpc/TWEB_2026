package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.EsercizioScheda;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EsercizioSchedaRepository extends JpaRepository<EsercizioScheda, Long> {
    List<EsercizioScheda> findByLogAllenamentoId(Long logAllenamentoId);
}