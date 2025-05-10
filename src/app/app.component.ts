import { Component } from '@angular/core';
import { Tarefa } from "./tarefa";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, tap, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TODOapp';
  arrayDeTarefas: Tarefa[] = [];
  apiURL: string;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient) {
    this.apiURL = 'https://back-todoapp-om3r.onrender.com';
    this.READ_tarefas();
  }

  private handleError(error: HttpErrorResponse) {
    this.errorMessage = 'Ocorreu um erro na operação. Por favor, tente novamente.';
    console.error('Erro:', error);
    return throwError(() => error);
  }

  CREATE_tarefa(descricaoNovaTarefa: string) {
    this.isLoading = true;
    const novaTarefa = new Tarefa(descricaoNovaTarefa, false);
    
    this.http.post<Tarefa>(`${this.apiURL}/api/post`, novaTarefa)
      .pipe(
        retry(3),
        catchError(this.handleError.bind(this)),
        finalize(() => {
          this.isLoading = false;
          this.READ_tarefas(); // Sempre recarrega a lista após criar
        })
      )
      .subscribe({
        next: (resultado) => {
          console.log('Tarefa criada:', resultado);
        },
        error: (error) => {
          console.error('Erro ao criar tarefa:', error);
        }
      });
  }

  READ_tarefas() {
    this.isLoading = true;
    this.http.get<Tarefa[]>(`${this.apiURL}/api/getAll`)
      .pipe(
        retry(3),
        catchError(this.handleError.bind(this)),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (resultado) => {
          this.arrayDeTarefas = resultado;
          console.log('Tarefas carregadas:', resultado);
        },
        error: (error) => {
          console.error('Erro ao carregar tarefas:', error);
        }
      });
  }

  DELETE_tarefa(tarefaAserRemovida: Tarefa) {
    this.isLoading = true;
    const indice = this.arrayDeTarefas.indexOf(tarefaAserRemovida);
    const id = this.arrayDeTarefas[indice]._id;
    
    this.http.delete<{message: string, id: string}>(`${this.apiURL}/api/delete/${id}`)
      .pipe(
        retry(3),
        catchError(this.handleError.bind(this)),
        finalize(() => {
          this.isLoading = false;
          this.READ_tarefas(); // Sempre recarrega a lista após deletar
        })
      )
      .subscribe({
        next: (resultado) => {
          console.log('Tarefa removida:', resultado);
        },
        error: (error) => {
          console.error('Erro ao remover tarefa:', error);
        }
      });
  }

  UPDATE_tarefa(tarefaAserModificada: Tarefa) {
    this.isLoading = true;
    const indice = this.arrayDeTarefas.indexOf(tarefaAserModificada);
    const id = this.arrayDeTarefas[indice]._id;
    
    this.http.patch<Tarefa>(`${this.apiURL}/api/update/${id}`, tarefaAserModificada)
      .pipe(
        retry(3),
        catchError(this.handleError.bind(this)),
        finalize(() => {
          this.isLoading = false;
          this.READ_tarefas(); // Sempre recarrega a lista após atualizar
        })
      )
      .subscribe({
        next: (resultado) => {
          console.log('Tarefa atualizada:', resultado);
        },
        error: (error) => {
          console.error('Erro ao atualizar tarefa:', error);
        }
      });
  }
}
