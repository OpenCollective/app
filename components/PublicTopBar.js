import React from 'react';
import { Link } from 'react-router';

class PublicTopBar extends React.Component {

  showSession() {
    const { session, logout } = this.props;
    const redirect = window.location.pathname;

    if(session && session.isAuthenticated) {
      return (
        <div>
          <span className="long">Logged in as</span> {session.user.username} &nbsp;
          <a href="" onClick={logout}>[logout]</a>
        </div>
      );
    }
    else {
      return (
        <div>
          <Link to={'/app/login?next='+redirect}>sign in</Link>
        </div>
      );
    }
  }

  render() {
    return (
      <div className='PublicTopBar'>
        <div className='PublicTopBar-tagLine'>
          <div className='OC-Icon'>
            <i className='Icon Icon--oc' />
          </div>
          <div className="Tagline">
            <a href="https://opencollective.com#apply">
              Join OpenCollective <span className="long">to start collecting funds for your group</span>
            </a>
          </div>
        </div>
        <div className='PublicTopBar-signup'>
          {this.showSession()}
        </div>
      </div>
    );
  } 
};

export default PublicTopBar;