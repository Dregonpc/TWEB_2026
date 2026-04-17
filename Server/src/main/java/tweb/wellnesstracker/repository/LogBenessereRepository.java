package tweb.wellnesstracker.repository;

import tweb.wellnesstracker.persistence.LogBenessere;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LogBenessereRepository extends JpaRepository<LogBenessere, Long> {
    List<LogBenessere> findByUtenteId(Long utenteId);
    List<LogBenessere> findByUtenteIdOrderByDataDesc(Long utenteId);
}