import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as io from 'socket.io-client';
import { LocalStorageService } from 'ng2-webstorage';

import { environment } from 'environments/environment';
import { IStore } from 'app/shared/interfaces/store.interface';
import {
  IOrderCommon,
  INewOrder,
  IOrder,
} from 'app/shared/states/orders/orders.interface';
import * as UsersActions from 'app/shared/states/users/users.actions';
import * as OrdersActions from 'app/shared/states/orders/orders.actions';
import * as UiActions from 'app/shared/states/ui/ui.actions';

@Injectable()
export class WebsocketService {
  private usersSocket: SocketIOClient.Socket;
  private ordersSocket: SocketIOClient.Socket;

  constructor(
    private store$: Store<IStore>,
    private storage: LocalStorageService
  ) {
    this.usersSocket = io(`${environment.urlBackend}/users`);
    this.ordersSocket = io(`${environment.urlBackend}/orders`);

    // TODO(SPLIT_SOCKET) : Instead of handling every socket from here, we should handle them from separate services
    this.usersSocket.on('CONNECT_USER_SUCCESS', user => {
      console.log(`CONNECT_USER_SUCCESS`);
      this.connectUserSuccess(user);
    });
    this.usersSocket.on('DISCONNECT_USER_SUCCESS', userId =>
      this.onDisconnectUserSuccess(userId)
    );
    // this.ordersSocket.on('ADD_ORDER_SUCCESS', order => this.onAddOrderSuccess(order));
    // this.ordersSocket.on('REMOVE_ORDER_SUCCESS', orderId =>
    //   this.onRemoveOrderSuccess(orderId)
    // );
    // this.ordersSocket.on(
    //   'SET_COUNTDOWN',
    //   ({ hour, minute }: { hour: number; minute: number }) => {
    //     console.log(`SET_COUNTDOWN`, hour, minute);
    //     this.onSetCountdown(hour, minute);
    //   }
    // );
  }

  public connectUser(username: string) {
    this.storage.store('username', username);
    this.usersSocket.emit('CONNECT_USER', username);
  }

  private connectUserSuccess(user) {
    if (this.storage.retrieve('username') === user.username) {
      this.store$.dispatch(new UsersActions.IdentificationSuccess(user.id));
      this.store$.dispatch(new UiActions.CloseDialogIdentification());
    }

    this.store$.dispatch(new UsersActions.AddUserSuccess(user));
  }

  public addOrder(order: INewOrder & { userId: string }) {
    // this.ordersSocket.emit('ADD_ORDER', order);
  }

  private onAddOrderSuccess(order: IOrder) {
    this.store$.dispatch(new OrdersActions.AddOrderSuccess(order));
  }

  public removeOrder(orderId: string) {
    // this.ordersSocket.emit('REMOVE_ORDER', orderId);
  }

  private onRemoveOrderSuccess(id: string) {
    this.store$.dispatch(new OrdersActions.RemoveOrderSuccess({ id }));
  }

  private onUserOnline(id: string) {
    this.store$.dispatch(new UsersActions.SetUserOnline({ id }));
  }

  private onDisconnectUserSuccess(id: string) {
    this.store$.dispatch(new UsersActions.SetUserOffline({ id }));
  }

  private onSetCountdown(hour: number, minute: number) {
    this.store$.dispatch(new OrdersActions.SetCountdown({ hour, minute }));
  }
}
