export abstract class Command {
  abstract titleWithParams: string;
  abstract description: string;

  constructor(private _vorpal: any) {}

  getAutocomplete(): string[] | false {
    return false;
  }

  abstract action(
    args: { [key: string]: string },
    callback: () => void,
    vorpalContext: { log: (msg: string) => void }
  );

  register(): void {
    const self = this;

    const command = this._vorpal
      .command(this.titleWithParams)
      .description(this.description);

    if (this.getAutocomplete() !== false) {
      command.autocomplete((() => this.getAutocomplete())());
    }

    command.action(function(args, callback) {
      const vorpalContext = this;
      self.action(args, callback, vorpalContext);
    });
  }
}
