package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "schede_allenamento")
public class SchedaAllenamento {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "titolo", nullable = false)
    private String titolo;

    @Column(name = "data_creazione")
    private LocalDate dataCreazione;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    @ManyToOne
    @JoinColumn(name = "coach_id", nullable = false)
    private Utente coach;

    public SchedaAllenamento() {}

    public SchedaAllenamento(String titolo, LocalDate dataCreazione, String note, Utente utente, Utente coach) {
        this.titolo = titolo;
        this.dataCreazione = dataCreazione;
        this.note = note;
        this.utente = utente;
        this.coach = coach;
    }

    public Long getId() { return id; }
    public String getTitolo() { return titolo; }
    public LocalDate getDataCreazione() { return dataCreazione; }
    public String getNote() { return note; }
    public Utente getUtente() { return utente; }
    public Utente getCoach() { return coach; }

    public void setId(Long id) { this.id = id; }
    public void setTitolo(String titolo) { this.titolo = titolo; }
    public void setDataCreazione(LocalDate dataCreazione) { this.dataCreazione = dataCreazione; }
    public void setNote(String note) { this.note = note; }
    public void setUtente(Utente utente) { this.utente = utente; }
    public void setCoach(Utente coach) { this.coach = coach; }
}