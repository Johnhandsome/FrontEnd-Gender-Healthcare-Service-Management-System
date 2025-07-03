import { Component } from '@angular/core';

@Component({
  selector: 'app-support-chat',
  standalone: true,
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.css'],
})
export class SupportChatComponent {
  showChat = false;

  toggleChat() {
    this.showChat = !this.showChat;
  }
}
