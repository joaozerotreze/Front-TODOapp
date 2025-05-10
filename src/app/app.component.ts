import { Component } from '@angular/core';
import { Tarefa } from "./tarefa";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, tap } from 'rxjs/operators';
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
    const novaTarefa = new Tarefa(descricaoNovaTarefa, false);
    this.http.post<Tarefa>(`${this.apiURL}/api/post`, novaTarefa)
      .pipe(
        retry(3),
        catchError(this.handleError.bind(this)),
        tap((resultado) => {
          this.arrayDeTarefas = [resultado, ...this.arrayDeTarefas];
          console.log('Tarefa criada:', resultado);
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Erro ao criar tarefa:', error);
          this.READ_tarefas();
        }
      });
  }

  READ_tarefas() {
    this.http.get<Tarefa[]>(`${this.apiURL}/api/getAll`)
      .pipe(
        retry(3),
        catchError(this.handleError.bind(this))
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
    const indice = this.arrayDeTarefas.indexOf(tarefaAserRemovida);
    const id = this.arrayDeTarefas[indice]._id;
    this.http.delete<Tarefa>(`${this.apiURL}/api/delete/${id}`)
      .pipe(
        retry(3),
        catchError(this.handleError.bind(this)),
        tap(() => {
          this.arrayDeTarefas = this.arrayDeTarefas.filter(t => t._id !== id);
          console.log('Tarefa removida do array local');
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Erro ao remover tarefa:', error);
          this.READ_tarefas();
        }
      });
  }

  UPDATE_tarefa(tarefaAserModificada: Tarefa) {
    const indice = this.arrayDeTarefas.indexOf(tarefaAserModificada);
    const id = this.arrayDeTarefas[indice]._id;
    this.http.patch<Tarefa>(`${this.apiURL}/api/update/${id}`, tarefaAserModificada)
      .pipe(
        retry(3),
        catchError(this.handleError.bind(this)),
        tap((resultado) => {
          this.arrayDeTarefas = this.arrayDeTarefas.map(t => 
            t._id === id ? resultado : t
          );
          console.log('Tarefa atualizada no array local:', resultado);
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Erro ao atualizar tarefa:', error);
          this.READ_tarefas();
        }
      });
  }
}
