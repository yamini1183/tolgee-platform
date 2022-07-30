/// <reference types="cypress" />

import { login } from '../../common/apiCalls/common';
import {
  assertMessage,
  confirmStandard,
  gcy,
  selectInSelect,
} from '../../common/shared';
import 'cypress-file-upload';
import { administrationTestData } from '../../common/apiCalls/testData/testData';
import { HOST } from '../../common/constants';
import {
  getUserListItem,
  visitAdministration,
} from '../../common/administration';

describe('Administration', () => {
  beforeEach(() => {
    administrationTestData.clean();
    administrationTestData.generate().then((res) => {});
    login('admin@admin.com');
    visitAdministration();
  });

  afterEach(() => {
    administrationTestData.clean();
  });

  it('gets to the administration via menu', () => {
    visit();
    gcy('global-user-menu-button').click();
    gcy('user-menu-server-administration').click();
    gcy('administration-tabs-organizations').should('be.visible');
  });

  it('there is no administration button for standard user', () => {
    login('user@user.com');
    visit();
    gcy('global-user-menu-button').click();
    gcy('user-menu-server-administration').should('not.exist');
  });

  it('can access organization projects', () => {
    visitAdministration();
    getOrganizationListItem()
      .findDcy('administration-organizations-projects-button')
      .click();
    assertAdminFrameVisible();
    gcy('navigation-item').contains('Projects');
  });

  it('can access organization settings', () => {
    visitAdministration();
    getOrganizationListItem()
      .findDcy('administration-organizations-settings-button')
      .click();
    assertAdminFrameVisible();
    cy.contains('Organization profile').should('be.visible');
  });

  it('can change user permission', () => {
    visitAdministration();
    gcy('administration-tabs-users').click();
    changeUserRole('John User', 'Admin');
    changeUserRole('John User', 'User');
    getUserRoleSelect('Peter Administrator')
      .find('div')
      .should('have.attr', 'aria-disabled', 'true');
  });
});

const visit = () => {
  cy.visit(HOST);
};

function getOrganizationListItem() {
  return cy
    .contains('John User')
    .closestDcy('administration-organizations-list-item')
    .parent();
}

function assertAdminFrameVisible() {
  gcy('administration-access-message').should('be.visible');
  gcy('administration-frame').should('exist');
}

function getUserRoleSelect(user: string) {
  return getUserListItem(user).findDcy('administration-user-role-select');
}

function changeUserRole(user: string, role: 'Admin' | 'User') {
  selectInSelect(getUserRoleSelect(user), role);
  confirmStandard();
  assertMessage('Role changed');
}
