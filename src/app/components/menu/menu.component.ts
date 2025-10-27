import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'menu',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLink],
  templateUrl: './menu.component.html'
})
export class MenuComponent {

}
