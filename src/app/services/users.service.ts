import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

@Injectable()
export class UsersService {

  constructor(private _httpService: HttpService, public route: Router) { }

  getUserData(data) {
    return this._httpService.doPost("user/getCompanyAdminUsers", data);
  }

  getTerritory() {
    return this._httpService.doGet("territory/getTerritory");
  }

  getCompanyUserData(data) {
    return this._httpService.doPost('user/getCompanyUsers', data)
  }

  getUserById(id) {
    return this._httpService.doPost('user/getUserById', { user_id: id })
  }

  getUserRoles(data) {
    return this._httpService.doPost("user/getUserRole", data);
  }

  getUserRoleById(id) {
    return this._httpService.doPost('user/getRoleById', { role_id: id })
  }

  getDefaultRoles(data) {
    return this._httpService.doPost('user/getDefaultRole', data);
  }

  registerUser(data) {
    return this._httpService.doPost("user/create", data);
  }

  updateUser(data) {
    return this._httpService.doPost("user/update", data);
  }
  updateRole(data) {
    return this._httpService.doPost("user/updateRole", data);
  }

  deactivateRole(data) {
    return this._httpService.doPost("user/update", data);
  }

  createUserRole(data) {
    return this._httpService.doPost("user/createRole", data);
  }

  getCompanyDetails(data) {
    return this._httpService.doPost("user/findUserById", data);
  }

  getReviewersList(data) {
    return this._httpService.doPost("user/getReviewersList", data);
  }

  getBusinessUnitForUser(data) {
    return this._httpService.doPost("businessUnit/getBusinessUnitForUser", data);
  }

  getTerritoriesForUser(data) {
    return this._httpService.doPost("territory/getTerritoriesForUser", data);
  }
  
  // Delete user from Company Admin
  getDeleteUser(user_id) {
    return this._httpService.doPost('usersTasks/getUserTasks', user_id)
  }

  deleteUserNotification(data) {
    return this._httpService.doPost('usersTasks/deleteUserNotification', data)
  }

  getApprovalTask(user_id) {
    return this._httpService.doPost('usersTasks/getApproverTask', user_id)
  }

  ReAssignApprovalTask(user_id) {
    return this._httpService.doPost('taskReassignUsers/bidReassignApproverPerson', user_id)
  }
}
