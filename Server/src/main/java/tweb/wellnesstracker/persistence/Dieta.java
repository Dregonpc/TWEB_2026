package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "diete")
public class Dieta {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "titolo", nullable = false)
    private String titolo;

    @Column(name = "data_creazione")
    private LocalDate dataCreazione;

    @Column(name = "kcal_totali")
    private Integer kcalTotali;

    @Column(name = "descrizione")
    private String descrizione;

    @Column(name = "alternative")
    private String alternative;

    @ManyToOne
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    @ManyToOne
    @JoinColumn(name = "coach_id", nullable = false)
    private Utente coach;

    public Dieta() {}

    public Dieta(String titolo, LocalDate dataCreazione, Integer kcalTotali, String descrizione, String alternative, Utente utente, Utente coach) {
        this.titolo = titolo;
        this.dataCreazione = dataCreazione;
        this.kcalTotali = kcalTotali;
        this.descrizione = descrizione;
        this.alternative = alternative;
        this.utente = utente;
        this.coach = coach;
    }

    public Long getId() { return id; }
    public String getTitolo() { return titolo; }
    public LocalDate getDataCreazione() { return dataCreazione; }
    public Integer getKcalTotali() { return kcalTotali; }
    public String getDescrizione() { return descrizione; }
    public String getAlternative() { return alternative; }
    public Utente getUtente() { return utente; }
    public Utente getCoach() { return coach; }

    public void setId(Long id) { this.id = id; }
    public void setTitolo(String titolo) { this.titolo = titolo; }
    public void setDataCreazione(LocalDate dataCreazione) { this.dataCreazione = dataCreazione; }
    public void setKcalTotali(Integer kcalTotali) { this.kcalTotali = kcalTotali; }
    public void setDescrizione(String descrizione) { this.descrizione = descrizione; }
    public void setAlternative(String alternative) { this.alternative = alternative; }
    public void setUtente(Utente utente) { this.utente = utente; }
    public void setCoach(Utente coach) { this.coach = coach; }
}