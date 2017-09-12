import { LeafletStuffPage } from './app.po';

describe('leaflet-stuff App', () => {
  let page: LeafletStuffPage;

  beforeEach(() => {
    page = new LeafletStuffPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
