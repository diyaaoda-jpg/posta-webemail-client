import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { EmailService } from '../../core/services/email.service';
import { EmailActions } from './email.actions';

@Injectable()
export class EmailEffects {
  private actions$ = inject(Actions);
  private emailService = inject(EmailService);

  loadEmails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.loadEmails),
      switchMap(({ accountId, params }) =>
        this.emailService.getEmails(accountId, params).pipe(
          map((response) => EmailActions.loadEmailsSuccess({ response })),
          catchError((error) =>
            of(EmailActions.loadEmailsFailure({ error: error.message || 'Failed to load emails' }))
          )
        )
      )
    )
  );

  loadEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.loadEmail),
      switchMap(({ id }) =>
        this.emailService.getEmail(id).pipe(
          map((email) => EmailActions.loadEmailSuccess({ email })),
          catchError((error) =>
            of(EmailActions.loadEmailFailure({ error: error.message || 'Failed to load email' }))
          )
        )
      )
    )
  );

  markAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.markAsRead),
      mergeMap(({ id, isRead }) =>
        this.emailService.markAsRead(id, isRead).pipe(
          map(() => EmailActions.markAsReadSuccess({ id, isRead })),
          catchError((error) =>
            of(EmailActions.markAsReadFailure({ error: error.message || 'Failed to update read status' }))
          )
        )
      )
    )
  );

  toggleFlag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.toggleFlag),
      mergeMap(({ id, isFlagged }) =>
        this.emailService.toggleFlag(id, isFlagged).pipe(
          map(() => EmailActions.toggleFlagSuccess({ id, isFlagged })),
          catchError((error) =>
            of(EmailActions.toggleFlagFailure({ error: error.message || 'Failed to update flag status' }))
          )
        )
      )
    )
  );

  deleteEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.deleteEmail),
      mergeMap(({ id }) =>
        this.emailService.deleteEmail(id).pipe(
          map(() => EmailActions.deleteEmailSuccess({ id })),
          catchError((error) =>
            of(EmailActions.deleteEmailFailure({ error: error.message || 'Failed to delete email' }))
          )
        )
      )
    )
  );

  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.loadAccounts),
      switchMap(() =>
        this.emailService.getAccounts().pipe(
          map((accounts) => EmailActions.loadAccountsSuccess({ accounts })),
          catchError((error) =>
            of(EmailActions.loadAccountsFailure({ error: error.message || 'Failed to load accounts' }))
          )
        )
      )
    )
  );

  // Email Composition Effects
  sendEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.sendEmail),
      mergeMap(({ emailData }) =>
        this.emailService.sendEmail(emailData).pipe(
          map((email) => EmailActions.sendEmailSuccess({ email })),
          catchError((error) =>
            of(EmailActions.sendEmailFailure({ error: error.message || 'Failed to send email' }))
          )
        )
      )
    )
  );

  saveDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.saveDraft),
      mergeMap(({ draftData }) =>
        this.emailService.saveDraft(draftData).pipe(
          map((draft) => EmailActions.saveDraftSuccess({ draft })),
          catchError((error) =>
            of(EmailActions.saveDraftFailure({ error: error.message || 'Failed to save draft' }))
          )
        )
      )
    )
  );

  loadDrafts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.loadDrafts),
      switchMap(() =>
        this.emailService.getDrafts().pipe(
          map((drafts) => EmailActions.loadDraftsSuccess({ drafts })),
          catchError((error) =>
            of(EmailActions.loadDraftsFailure({ error: error.message || 'Failed to load drafts' }))
          )
        )
      )
    )
  );

  deleteDraft$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmailActions.deleteDraft),
      mergeMap(({ draftId }) =>
        this.emailService.deleteEmail(draftId).pipe(
          map(() => EmailActions.deleteDraftSuccess({ draftId })),
          catchError((error) =>
            of(EmailActions.deleteDraftFailure({ error: error.message || 'Failed to delete draft' }))
          )
        )
      )
    )
  );
}