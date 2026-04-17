package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "commenti_allenamento")
public class CommentoAllenamento {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "testo", nullable = false)
    private String testo;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @ManyToOne
    @JoinColumn(name = "coach_id", nullable = false)
    private Utente coach;

    @ManyToOne
    @JoinColumn(name = "log_allenamento_id", nullable = false)
    private LogAllenamento logAllenamento;

    public CommentoAllenamento() {}

    public CommentoAllenamento(String testo, LocalDate data, Utente coach, LogAllenamento logAllenamento) {
        this.testo = testo;
        this.data = data;
        this.coach = coach;
        this.logAllenamento = logAllenamento;
    }

    public Long getId() { return id; }
    public String getTesto() { return testo; }
    public LocalDate getData() { return data; }
    public Utente getCoach() { return coach; }
    public LogAllenamento getLogAllenamento() { return logAllenamento; }

    public void setId(Long id) { this.id = id; }
    public void setTesto(String testo) { this.testo = testo; }
    public void setData(LocalDate data) { this.data = data; }
    public void setCoach(Utente coach) { this.coach = coach; }
    public void setLogAllenamento(LogAllenamento logAllenamento) { this.logAllenamento = logAllenamento; }
}