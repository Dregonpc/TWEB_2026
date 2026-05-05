package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;

@Entity
@Table(name = "esercizi_svolti")
public class EsercizioSvolto {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "nome_esercizio", nullable = false)
    private String nomeEsercizio;

    @Column(name = "serie")
    private Integer serie;

    @Column(name = "ripetizioni")
    private Integer ripetizioni;

    @Column(name = "peso")
    private Integer peso;

    @Column(name = "durata")
    private Integer durata;

    @Column(name = "commento")
    private String commento;

    @ManyToOne
    @JoinColumn(name = "log_allenamento_id", nullable = false)
    private LogAllenamento logAllenamento;

    public EsercizioSvolto() {}

    public EsercizioSvolto(String nomeEsercizio, Integer serie, Integer ripetizioni, Integer peso, Integer durata, String commento, LogAllenamento logAllenamento) {
        this.nomeEsercizio = nomeEsercizio;
        this.serie = serie;
        this.ripetizioni = ripetizioni;
        this.peso = peso;
        this.durata = durata;
        this.commento = commento;
        this.logAllenamento = logAllenamento;
    }

    public Long getId() { return id; }
    public String getNomeEsercizio() { return nomeEsercizio; }
    public Integer getSerie() { return serie; }
    public Integer getRipetizioni() { return ripetizioni; }
    public Integer getPeso() { return peso; }
    public Integer getDurata() { return durata; }
    public String getCommento() { return commento; }
    public LogAllenamento getLogAllenamento() { return logAllenamento; }

    public void setId(Long id) { this.id = id; }
    public void setNomeEsercizio(String nomeEsercizio) { this.nomeEsercizio = nomeEsercizio; }
    public void setSerie(Integer serie) { this.serie = serie; }
    public void setRipetizioni(Integer ripetizioni) { this.ripetizioni = ripetizioni; }
    public void setPeso(Integer peso) { this.peso = peso; }
    public void setDurata(Integer durata) { this.durata = durata; }
    public void setCommento(String commento) { this.commento = commento; }
    public void setLogAllenamento(LogAllenamento logAllenamento) { this.logAllenamento = logAllenamento; }
}