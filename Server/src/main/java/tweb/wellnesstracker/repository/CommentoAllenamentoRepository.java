package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.CommentoAllenamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentoAllenamentoRepository extends JpaRepository<CommentoAllenamento, Long> {
    List<CommentoAllenamento> findByLogAllenamentoId(Long logAllenamentoId);
    List<CommentoAllenamento> findByCoachId(Long coachId);
    void deleteByLogAllenamentoId(Long logAllenamentoId);
}