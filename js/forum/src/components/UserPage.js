import Component from 'flarum/Component';
import ItemList from 'flarum/utils/ItemList';
import affixSidebar from 'flarum/utils/affixSidebar';
import UserCard from 'flarum/components/UserCard';
import LoadingIndicator from 'flarum/components/LoadingIndicator';
import SelectDropdown from 'flarum/components/SelectDropdown';
import LinkButton from 'flarum/components/LinkButton';
import Separator from 'flarum/components/Separator';
import listItems from 'flarum/helpers/listItems';

/**
 * The `UserPage` component shows a user's profile. It can be extended to show
 * content inside of the content area. See `ActivityPage` and `SettingsPage` for
 * examples.
 *
 * @abstract
 */
export default class UserPage extends Component {
  constructor(...args) {
    super(...args);

    /**
     * The user this page is for.
     *
     * @type {User}
     */
    this.user = null;

    app.history.push('user');
    app.current = this;
    app.drawer.hide();
  }

  view() {
    return (
      <div>
        {this.user ? [
          UserCard.component({
            user: this.user,
            className: 'hero user-hero',
            editable: this.user.canEdit(),
            controlsButtonClassName: 'btn btn-default'
          }),
          <div className="container">
            <nav className="side-nav user-nav" config={affixSidebar}>
              <ul>{listItems(this.sidebarItems().toArray())}</ul>
            </nav>
            <div className="offset-content user-content">
              {this.content()}
            </div>
          </div>
        ] : [
          LoadingIndicator.component({className: 'loading-indicator-block'})
        ]}
      </div>
    );
  }

  config(isInitialized, context) {
    if (isInitialized) return;

    $('body').addClass('user-page');
    context.onunload = () => $('body').removeClass('user-page');
  }

  /**
   * Get the content to display in the user page.
   *
   * @return {VirtualElement}
   */
  content() {
  }

  /**
   * Initialize the component with a user, and trigger the loading of their
   * activity feed.
   *
   * @param {User} user
   * @protected
   */
  init(user) {
    this.user = user;

    app.setTitle(user.username());
  }

  /**
   * Given a username, load the user's profile from the store, or make a request
   * if we don't have it yet. Then initialize the profile page with that user.
   *
   * @param {[type]} username [description]
   * @return {[type]}
   */
  loadUser(username) {
    const lowercaseUsername = username.toLowerCase();

    app.store.all('users').some(user => {
      if (user.username().toLowerCase() === lowercaseUsername && user.joinTime()) {
        this.init(user);
        return true;
      }
    });

    if (!this.user) {
      app.store.find('users', username).then(this.init.bind(this));
    }
  }

  /**
   * Build an item list for the content of the sidebar.
   *
   * @return {ItemList}
   */
  sidebarItems() {
    const items = new ItemList();

    items.add('nav',
      SelectDropdown.component({
        children: this.navItems().toArray(),
        itemClass: 'title-control'
      })
    );

    return items;
  }

  /**
   * Build an item list for the navigation in the sidebar.
   *
   * @return {ItemList}
   */
  navItems() {
    const items = new ItemList();
    const user = this.user;

    items.add('activity',
      LinkButton.component({
        href: app.route('user.activity', {username: user.username()}),
        children: 'Activity',
        icon: 'user'
      })
    );

    items.add('discussions',
      LinkButton.component({
        href: app.route('user.discussions', {username: user.username()}),
        children: ['Discussions', <span className="count">{user.discussionsCount()}</span>],
        icon: 'reorder'
      })
    );

    items.add('posts',
      LinkButton.component({
        href: app.route('user.posts', {username: user.username()}),
        children: ['Posts', <span className="count">{user.commentsCount()}</span>],
        icon: 'comment-o'
      })
    );

    if (app.session.user === user) {
      items.add('separator', Separator.component());
      items.add('settings',
        LinkButton.component({
          href: app.route('settings'),
          children: 'Settings',
          icon: 'cog'
        })
      );
    }

    return items;
  }
}