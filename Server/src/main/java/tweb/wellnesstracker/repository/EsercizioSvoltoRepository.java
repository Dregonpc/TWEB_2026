package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.EsercizioSvolto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EsercizioSvoltoRepository extends JpaRepository<EsercizioSvolto, Long> {
    List<EsercizioSvolto> findByLogAllenamentoId(Long logAllenamentoId);
    void deleteByLogAllenamentoId(Long logAllenamentoId);
}