package tweb.wellnesstracker.persistence;

import jakarta.persistence.*;

@Entity
@Table(name = "utenti")
public class Utente {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "ruolo", nullable = false)
    private String ruolo; // "USER", "COACH", "PSICOLOGO"

    @Column(name = "nome")
    private String nome;

    @Column(name = "cognome")
    private String cognome;

    @Column(name = "email")
    private String email;

    public Utente() {
    }

    public Utente(String username, String password, String ruolo, String nome, String cognome, String email) {
        this.username = username;
        this.password = password;
        this.ruolo = ruolo;
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getRuolo() { return ruolo; }
    public String getNome() { return nome; }
    public String getCognome() { return cognome; }
    public String getEmail() { return email; }

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setRuolo(String ruolo) { this.ruolo = ruolo; }
    public void setNome(String nome) { this.nome = nome; }
    public void setCognome(String cognome) { this.cognome = cognome; }
    public void setEmail(String email) { this.email = email; }
}