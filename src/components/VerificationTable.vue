<template>
  <v-container>
    <div id="appp">
      <div class="notification-container">
        <div :class="['notification', notificationClassSuccess]" @click="hideNotificationClassSuccess">
          {{ notificationClassSuccessMsg }}
        </div>
      </div>
      <div class="notification-container">
        <div :class="['notification', notificationClassFailed]" @click="hideNotificationClassFailed">
          {{ notificationClassFailedMsg }}
        </div>
      </div>
    </div>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Anomaly Verification Table:
          </v-card-title>
          <v-card-subtitle>
            <v-btn style="float:right; margin-right: 10px; background-color: rgb(13 110 110) !important"
              @click="openAdd()" color="secondary"><v-icon left style="font-size: 29px;">mdi-plus</v-icon></v-btn>
            <v-btn style="float:right;  margin-right: 10px;     background-color: black !important; color:white"
              @click="openSelectYear"><v-icon left style="font-size: 29px;">mdi-calendar-range</v-icon></v-btn>
            <v-btn style="float:right; margin-right: 10px;" @click="fetchMonthlyAnomalies" color="primary"><v-icon left
                style="font-size: 29px;">mdi-refresh</v-icon></v-btn>
            <v-btn style="float:right; margin-right: 10px; background-color: #26922b !important;"
              @click="openConsummersTable" color="primary"><v-icon left
                style="font-size: 29px;">mdi-table-account</v-icon></v-btn>
          </v-card-subtitle>
          <v-data-table :headers="headers" :items="anomalies" item-key="month" hide-default-footer :items-per-page="12"
            class="cantine_show_2 custom-scrollbar mt-5">
            <template v-slot:default="{ items }">
              <thead>
                <tr>
                  <th v-for="header in headers" :key="header.value">{{ header.text }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.month">
                  <td>{{ getMonthName(parseInt(item.month.split("/")[0])) }}</td>
                  <td>{{ item.anomalies_count }}</td>
                  <td>{{ item.count }}</td>
                  <td>
                    <v-btn style="margin-right: 10px; height: 25px;    background-color: rgb(46 86 132) !important"
                      @click="viewMonthlyConsumption(item.month.split('/')[0])" color="primary">VIEW</v-btn>

                    <v-btn style="height: 25px;" @click="openClearMsg(item.month.split('/')[0])"
                      color="red">CLEAR</v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog_add_open" max-width="1300px">
      <v-card>
        <v-card-title style="background-color: rgb(101 127 127);color: white;">
          ADD CONSUMPTIONS FILE :
        </v-card-title>
        <v-card-text v-if="cantineTableAfterCheck == null" style="color:black">
          <v-file-input style="color:black" clearable @change="onFileChangeCantine"
            label="Add consomations file to verify ..."></v-file-input>
        </v-card-text>
        <v-card-text v-else style="color:black">
          <v-row>
            <v-col cols="12">
              <v-row>
                <v-col cols="8">
                  <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" variant="outlined"
                    hide-details single-line></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-radio-group v-model="selectRadio" inline @update:modelValue="handleRadioChange"
                    style="margin-left: -16px;">
                    <v-radio style="font-weight: 700;" color="gay" :label="'All(' + cantineTableAfterCheck.length + ')'"
                      value="all"></v-radio>
                    <v-radio style="font-weight: 700;" color="indigo"
                      :label="'Valid(' + cantineTableAfterCheck.filter((e) => { return e.anomalie == 'valid' }).length + ')'"
                      value="valid"></v-radio>
                    <v-radio style="font-weight: 700;" color="#ffc107"
                      :label="'Invalid(' + cantineTableAfterCheck.filter((e) => { return e.anomalie == 'invalid' }).length + ')'"
                      value="invalid"></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">

              <v-data-table :headers="cantineTableAfterCheck_headers" :items="filteredListConsrsl" :search="search"
                hide-default-footer :items-per-page="filteredListConsrsl.length" item-key="id"
                class="cantine_show_ custom-scrollbar">
                <template v-slot:item="{ item }">
                  <tr :key="item.id" :class="{
                    'selectedInomali': item.anomalie === 'invalid' && item.checked,
                    'warning-row': item.anomalie !== 'valid',
                    'selectedNotInomali': item.anomalie === 'valid' && item.checked
                  }" @click="item.checked = !item.checked">
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{ item.matricule }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{
                      item.nomPrenom.toUpperCase() }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{ item.date + ' ' +
                      item.heure
                      }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{
                      item.description.toUpperCase() }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">
                      X{{ String(item.qte.split('.')[0]).padStart(2, '0') }}
                    </td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{ item.mt_sub }} (DH)</td>
                    <td style="text-align: center; font-weight: 700;" class="caseForTable">
                      <v-chip style="text-align: center; font-weight: 700;"
                        :class="{ 'invalid-chip': item.anomalie !== 'valid' }">
                        {{ item.anomalie.toUpperCase() }}
                      </v-chip>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-col>
          </v-row>


        </v-card-text>
        <v-card-actions>






          <v-btn
            v-if="cantineTableAfterCheck != null && cantineTableAfterCheck.filter((e) => e.checked).length == cantineTableAfterCheck.length"
            style="float: left; margin-left: 10px; background-color: #2e7272; color: white !important;"
            @click="UnSelectAll">
            <v-icon left style="font-size: 29px;margin-right: 10px;">mdi-chevron-down-box</v-icon>
            <!-- This is the icon part -->
            UNSELECT ALL ({{ cantineTableAfterCheck ? cantineTableAfterCheck.filter((e) => e.checked).length : 0 }})
          </v-btn>
          <v-btn
            v-if="cantineTableAfterCheck != null && cantineTableAfterCheck.filter((e) => e.checked).length != cantineTableAfterCheck.length"
            style="float: left; margin-left: 10px; background-color: white; color: #2e7272 !important; border: 1px solid #2e7272;"
            @click="selectAll">
            <v-icon left style="font-size: 29px;margin-right: 10px;">mdi-chevron-down-box-outline</v-icon>
            <!-- This is the icon part -->
            SELECT ALL ({{ cantineTableAfterCheck ? cantineTableAfterCheck.filter((e) => e.checked).length : 0 }})
          </v-btn>



          <v-btn v-if="cantineTableAfterCheck != null && cantineTableAfterCheck.filter((e) => e.checked).length != 0"
            style="float: left; margin-left: 10px; background-color: rgb(211 16 16); color: white !important;"
            @click="deleteSelected = true">
            <v-icon left style="font-size: 29px;margin-right: 10px;">mdi-delete</v-icon> <!-- This is the icon part -->
            DELETE SELECTED ({{ cantineTableAfterCheck ? cantineTableAfterCheck.filter((e) => e.checked).length : 0 }})
          </v-btn>

          <v-divider style="opacity: 0;"></v-divider>
          <v-btn v-if="cantineTableAfterCheck == null" style="float:right; color: BLACK;"
            @click="dialog_add_open = false">CANCEL</v-btn>
          <v-btn v-if="cantineTableAfterCheck != null" style="float:right; color: red;"
            @click="cantineTableAfterCheck = null">BACK</v-btn>
          <v-btn v-if="cantineTableAfterCheck == null"
            style="float: right;margin-right: 10px;background-color: #0a9898;color: white !important;"
            @click="doValidate">IMPORT</v-btn>



          <v-btn v-if="cantineTableAfterCheck != null"
            style="float: right;margin-right: 10px;background-color:#50a13d;color: white !important;"
            @click="saveSelected = true">SAVE</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog" max-width="1200px">
      <v-card>
        <v-card-title>
          CONSUMPTIONS FOR THE MONTH OF {{ getMonthName(selectedMonth).toUpperCase() }}.
        </v-card-title>

        <v-card-text style="color:black">
          <v-row>
            <v-col cols="12">
              <v-row>
                <v-col cols="8">
                  <v-text-field v-model="search_2" label="Search" prepend-inner-icon="mdi-magnify" variant="outlined"
                    hide-details single-line></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-radio-group v-model="selectRadio_2" inline @update:modelValue="handleRadioChange"
                    style="margin-left: -16px;">
                    <v-radio style="font-weight: 700;" color="gay" :label="'All(' + consumption.length + ')'"
                      value="all"></v-radio>
                    <v-radio style="font-weight: 700;" color="indigo"
                      :label="'Valid(' + consumption.filter((e) => { return e.anomalie == 'valid' }).length + ')'"
                      value="valid"></v-radio>
                    <v-radio style="font-weight: 700;" color="#ffc107"
                      :label="'Invalid(' + consumption.filter((e) => { return e.anomalie == 'invalid' }).length + ')'"
                      value="invalid"></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">

              <v-data-table :headers="consumptionHeaders" :items="filteredListConsrs2" :search="search_2"
                hide-default-footer :items-per-page="filteredListConsrs2.length" item-key="id"
                class="cantine_show_ custom-scrollbar">
                <template v-slot:item="{ item }">
                  <tr :key="item.id" :class="{
                    'selectedInomali': item.anomalie === 'invalid' && item.checked,
                    'warning-row': item.anomalie !== 'valid',
                    'selectedNotInomali': item.anomalie === 'valid' && item.checked
                  }" @click="item.checked = !item.checked">
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{ item.id }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{ item.matricule }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{
                      item.nomPrenom.toUpperCase() }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{ item.date + ' ' +
                      item.heure
                      }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{
                      item.description.toUpperCase() }}</td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">
                      X{{ String(item.qte).padStart(2, '0') }}
                    </td>
                    <td style="text-align: center; font-weight: 600;" class="caseForTable">{{ item.mt_sub }} (DH)</td>
                    <td style="text-align: center; font-weight: 700;" class="caseForTable">
                      <v-chip style="text-align: center; font-weight: 700;"
                        :class="{ 'invalid-chip': item.anomalie !== 'valid' }">
                        {{ item.anomalie.toUpperCase() }}
                      </v-chip>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-col>
          </v-row>


        </v-card-text>
        <v-card-actions>
          <v-btn v-if="consumption.filter((e) => e.checked).length == consumption.length"
            style="float: left; margin-left: 10px; background-color: #2e7272; color: white !important;"
            @click="UnSelectAll_2">
            <v-icon left style="font-size: 29px;margin-right: 10px;">mdi-chevron-down-box</v-icon>
            <!-- This is the icon part -->
            UNSELECT ALL ({{ consumption ? consumption.filter((e) => e.checked).length : 0 }})
          </v-btn>
          <v-btn v-if="consumption.filter((e) => e.checked).length != consumption.length"
            style="float: left; margin-left: 10px; background-color: white; color: #2e7272 !important; border: 1px solid #2e7272;"
            @click="selectAll_2">
            <v-icon left style="font-size: 29px;margin-right: 10px;">mdi-chevron-down-box-outline</v-icon>
            <!-- This is the icon part -->
            SELECT ALL ({{ consumption ? consumption.filter((e) => e.checked).length : 0 }})
          </v-btn>



          <v-btn v-if="consumption.filter((e) => e.checked).length != 0"
            style="float: left; margin-left: 10px; background-color: rgb(211 16 16); color: white !important;"
            @click="deleteSelected_2 = true">
            <v-icon left style="font-size: 29px;margin-right: 10px;">mdi-delete</v-icon> <!-- This is the icon part -->
            DELETE SELECTED ({{ consumption ? consumption.filter((e) => e.checked).length : 0 }})
          </v-btn>

          <v-divider style="opacity: 0;"></v-divider>
          <v-btn style="float:right; color:black !important" @click="dialog = false">Fermer</v-btn>
          <v-btn style="float:right; margin-right: 10px; background-color: #26922b !important;" @click="downloadExcel"
            color="white">Télécharger en
            Excel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <template>
    <div class="text-center pa-4">
      <v-dialog v-model="consummers_saveSelected" max-width="500" persistent>
        <v-card class="confirmDialogInterface" prepend-icon="mdi-content-save-check"
          text="Are you sure you want to apply this changes?" title="SAVE CONSUMMERS">
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn style=" background-color: #808080c2; color: white !important;"
              @click="consummers_saveSelected = false"> No
            </v-btn>

            <v-btn style=" background-color: #50a13d; color: white !important;" @click="setCheckedCunsommers"> Yes
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </template>
  <template>
    <div class="text-center pa-4">
      <v-dialog v-model="openConsummersTableDialog" max-width="60%" persistent>
        <v-card class="confirmDialogInterface" prepend-icon="mdi-trash-can-outline" title="CONSUMPTIONS CLEARED">
          <v-card-text>
            <v-card title="Select Consummers to ignore:" flat>
              <template v-slot:text>
                <v-text-field v-model="search_consumers" label="Search" prepend-inner-icon="mdi-magnify"
                  variant="outlined" hide-details single-line class="pa-0"></v-text-field>
              </template>

              <v-data-table :headers="headers_consumers" :items="desserts_consumers" :search="search_consumers"
                class="cantine_show_ consummers_show_">
                <template v-slot:item="{ item }">
                  <tr class="usersTableRow">
                    <td style="padding-top: 14px;  text-align: center">{{ item.username }}</td>
                    <td style="padding-top: 14px;  text-align: center">{{ item.firstname }}</td>
                    <td style="padding-top: 14px;  text-align: center">{{ 0 }}</td>
                    <td style="padding-top: 14px;  text-align: center"><v-switch v-model="item.checked" color="red"
                        hide-details></v-switch>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card>
          </v-card-text>
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn @click="openConsummersTableDialog = false"> Close </v-btn>
            <v-btn @click="openConsummers_saveSelected"
              style="float: right; margin-left: 10px; background-color: #50a13d; color: white !important;"> Apply
            </v-btn>

          </template>
        </v-card>
      </v-dialog>
    </div>
  </template>
  <template>
    <div class="text-center pa-4">
      <v-dialog v-model="clearMSGSuccess" max-width="500" persistent>
        <v-card class="confirmDialogInterface" prepend-icon="mdi-trash-can-outline"
          text="The consumptions have been cleared successfully" title="CONSUMPTIONS CLEARED">
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn @click="clearMSGSuccess = false"> Close </v-btn>

          </template>
        </v-card>
      </v-dialog>
    </div>
  </template>
  <template>
    <div class="text-center pa-4">
      <v-dialog v-model="saveSelected" max-width="500" persistent>
        <v-card class="confirmDialogInterface" prepend-icon="mdi-content-save-check"
          text="Are you sure you want to save this consumptions items?" title="SAVE CONSUMPTIONS">
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn style=" background-color: #808080c2; color: white !important;" @click="saveSelected = false"> No
            </v-btn>

            <v-btn style=" background-color: #50a13d; color: white !important;" @click="saveConsumption"> Yes </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </template>
  <template>
    <div class="text-center pa-4">
      <v-dialog v-model="deleteSelected_2" max-width="500" persistent>
        <v-card class="confirmDialogInterface" prepend-icon="mdi-trash-can-outline"
          text="Are you sure you want to delete the selected consumption items?" title="DELETE CONSUMPTIONS">
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn style=" background-color: #808080c2; color: white !important;" @click="deleteSelected_2 = false"> No
            </v-btn>

            <v-btn style=" background-color: rgb(211 16 16); color: white !important;" @click="deletConsumption_2"> Yes
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </template>
  <template>
    <div class="text-center pa-4">
      <v-dialog v-model="deleteSelected" max-width="500" persistent>
        <v-card class="confirmDialogInterface" prepend-icon="mdi-trash-can-outline"
          text="Are you sure you want to remove the selected consumption items?" title="REMOVE CONSUMPTIONS">
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn style=" background-color: #808080c2; color: white !important;" @click="deleteSelected = false"> No
            </v-btn>

            <v-btn style=" background-color: rgb(211 16 16); color: white !important;" @click="deletConsumption_1"> Yes
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </template>
  <template>
    <div class="text-center pa-4">
      <v-dialog v-model="clearMSG" max-width="500" persistent>
        <v-card class="confirmDialogInterface" prepend-icon="mdi-trash-can-outline"
          text="Are you sure you want to clear this month?" title="CLEAR CONSUMPTIONS">
          <template v-slot:actions>
            <v-spacer></v-spacer>

            <v-btn @click="clearMSG = false"> No </v-btn>

            <v-btn @click="clearMonthlyConsumption"> Yes </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </template>
  <template>
    <div class="text-center pa-4">
      <v-dialog v-model="showSelectYear" max-width="500" persistent>
        <v-card class="confirmDialogInterface" prepend-icon="mdi-trash-can-outline" title="SELECT THE YEAR">
          <v-card-text>
            Select the Year(by default its 2024)<br>
            <v-select label="Select" clearable v-model="modalCaledarSelectedYear" :items="items"></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn @click="showSelectYear = false"> CANCEL </v-btn>

            <v-btn @click="fetchMonthlyAnomalies"> SELECT </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
</template>


<script>
import axios from 'axios';
import * as XLSX from 'xlsx'; // Importer la bibliothèque xlsx
import { mapActions } from "vuex";


export default {
  data() {
    return {
      notificationClassSuccess: "",
      notificationClassFailed: "",
      notificationClassSuccessMsg: "",
      notificationClassFailedMsg: "",
      consummers_saveSelected: false,
      search_consumers: '',
      headers_consumers: [
        {
          align: 'start',
          key: 'username',
          sortable: true,
          title: 'MATICULE',
        },
        { key: 'firstname', title: 'FULLNAME',sortable: true },
        { key: 'TOTAL CUNSUMPTIONS', title: 'TOTAL CUNSUMPTIONS' },
        { key: 'checked', title: 'EXCLUDED',sortable: true },
      ],
      desserts_consumers: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: 1,
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: 1,
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: 7,
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: 8,
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: 16,
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          iron: 0,
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          iron: 2,
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          iron: 45,
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          iron: 22,
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          iron: 6,
        },
      ],
      openConsummersTableDialog: false,
      saveSelected_2: false,
      deleteSelected_2: false,
      saveSelected: false,
      deleteSelected: false,
      selectRadio_2: 'all',
      search_2: '',
      selectRadio: 'all',
      search: '',
      dialog_add_open: false,
      dialog_add_month: "",
      dialog_add_year: "",
      consummers_headers: [
        { text: 'Matricule', value: 'month' },
        { text: 'Fullname', value: 'anomalies_count' },
        { text: 'TOTAL', value: 'count' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      headers: [
        { text: 'MONTH', value: 'month' },
        { text: 'ANOMALIES', value: 'anomalies_count' },
        { text: 'TOTAL', value: 'count' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],

      consumptionHeaders: [
        { sortable: true, title: 'CONS ID', value: 'id' },
        { sortable: true, title: 'MAT', value: 'matricule' },
        { sortable: true, title: 'FULL NAME', value: 'nomPrenom' },
        {
          sortable: true,
          title: 'DATE & TIME',
          value: 'combinedDateTime', // Custom field for combined sorting
          sort: (a, b) => {
            console.log("a:", a);
            console.log("b:", b);
            let d1 = new Date(a); // Combine date and time
            let d2 = new Date(b);
            return d1.getTime() - d2.getTime(); // Sort logic
          },
        },
        { sortable: true, title: 'DESCRIPTION', value: 'description' },
        { sortable: true, title: 'QUANTITY', value: 'qte' },
        { sortable: true, title: 'AMOUNT', value: 'mt_sub' },
        { sortable: true, title: 'ANOMALY', value: 'anomalie' },
      ],
      anomalies: [],
      consumption: [],
      dialog: false,
      selectedMonth: '',
      selectedYear: 2024,
      clearMSG: false,
      clearMSGSuccess: false,
      showSelectYear: false,
      modalCaledarSelectedYear: 2024
      ,
      items: [],
      filesCantine: null,
      cantineTableData: [],
      cantineTableHeaders: [],
      cantineTableAfterCheck: null,
      cantineTableAfterCheck_headers: [
        { sortable: true, title: 'ID', value: 'matricule' },
        { sortable: true, title: 'FULL NAME', value: 'nomPrenom' },
        {
          sortable: true,
          title: 'DATE & TIME',
          value: 'combinedDateTime', // Custom field for combined sorting
          sort: (a, b) => {
            console.log("a:", a);
            console.log("b:", b);
            let d1 = new Date(a); // Combine date and time
            let d2 = new Date(b);
            return d1.getTime() - d2.getTime(); // Sort logic
          },
        },
        { sortable: true, title: 'DESCRIPTION', value: 'description' },
        { sortable: true, title: 'QUANTITY', value: 'qte' },
        { sortable: true, title: 'AMOUNT', value: 'mt_sub' },
        { sortable: true, title: 'ANOMALY', value: 'anomalie' },
      ]

    };
  },
  methods: {
    ...mapActions([
      "setLoadingValueAction",
    ]),
    showNotificationClassSuccess(msg) {
      console.log("msg")
      this.notificationClassSuccessMsg = msg;
      // Show the notification
      setTimeout(() => {
        this.notificationClassSuccess = "show sucess";
      }, 500);

      // Hide the notification after 3 seconds
      setTimeout(() => {
        this.notificationClassSuccess = "hide sucess";
      }, 6000);
    },
    showNotificationClassFailed(msg) {
      this.notificationClassFailedMsg = msg;
      // Show the notification
      setTimeout(() => {
        this.notificationClassFailed = "show Failed";
      }, 500);

      setTimeout(() => {
        this.notificationClassFailed = "hide Failed";
      }, 6000);
    },
    openConsummers_saveSelected() {
      this.consummers_saveSelected = true;
    },
    async setCheckedCunsommers() {
      this.setLoadingValueAction(true);
      await axios.post('http://10.20.33.112:9017/api/consommateurs/setCheckAll', this.desserts_consumers)
        .then((e) => {
          this.desserts_consumers = e.data.map((e) => {
            e.checked = (e.checked == 1);
            return e;
          })
          .sort((a,b)=>b.checked - a.checked);
          this.consummers_saveSelected = false;
          this.setLoadingValueAction(false);
          this.showNotificationClassSuccess("Applied successfully !");
        })
        .catch(() => {
          this.setLoadingValueAction(false);
          this.showNotificationClassFailed("Request failed !");
        });
    },
    async openConsummersTable() {
      this.setLoadingValueAction(true);
      await axios.get('http://10.20.33.112:9017/api/consommateurs').then((e) => {
        this.desserts_consumers = e.data.map((e) => {
          e.checked = (e.checked == 1);
          return e;
        });
        console.log(e);
        this.setLoadingValueAction(false);
      })
        .catch(() => {
          this.setLoadingValueAction(false);
        });
      this.openConsummersTableDialog = true;
    },
    closeAdd() {
      this.search = '';
      this.cantineTableAfterCheck = null;
      this.dialog_add_open = false;
    },
    async saveConsumption() {
      this.setLoadingValueAction(true);
      await axios.post('http://10.20.33.112:9017/api/consommations/store_2', { anomalies: this.cantineTableAfterCheck }, {
        headers: { 'Content-Type': 'application/json' }
      }).then((e) => {
        this.saveSelected = false;
        this.fetchMonthlyAnomalies();
        this.closeAdd();
        console.log(e);
        this.setLoadingValueAction(false);
      })
    },
    async deletConsumption_2() {
      this.setLoadingValueAction(true);
      let ids = this.consumption.filter((e) => {
        return e.checked
      });
      console.log("ids :", ids);
      await axios.post('http://10.20.33.112:9017/api/consommations/deleteMultiple', ids, {
        headers: { 'Content-Type': 'application/json' }
      }).then((e) => {
        this.consumption = this.consumption.filter((e) => {
          return !e.checked
        });
        this.deleteSelected_2 = false;
        console.log(e);
        this.setLoadingValueAction(false);
      })
        .catch(() => {
          this.setLoadingValueAction(false);
        });

    },
    deletConsumption_1() {
      this.setLoadingValueAction(true);
      this.cantineTableAfterCheck = this.cantineTableAfterCheck.filter((e) => {
        return !e.checked
      });
      this.deleteSelected = false;
      this.setLoadingValueAction(false);
    },
    selectAll_2() {
      this.setLoadingValueAction(true);
      console.log("jzjzjz")
      this.consumption = this.consumption.map((e) => {
        e.checked = true;
        return e;
      });
      this.setLoadingValueAction(false);
    },
    UnSelectAll_2() {
      this.setLoadingValueAction(true);
      console.log("ssss")

      this.consumption = this.consumption.map((e) => {
        e.checked = false;
        return e;
      });
      this.setLoadingValueAction(false);
    },
    selectAll() {
      this.setLoadingValueAction(true);
      console.log("jzjzjz")
      this.cantineTableAfterCheck = this.cantineTableAfterCheck.map((e) => {
        e.checked = true;
        return e;
      });
      this.setLoadingValueAction(false);
    },
    UnSelectAll() {
      console.log("ssss")
      this.setLoadingValueAction(true);
      this.cantineTableAfterCheck = this.cantineTableAfterCheck.map((e) => {
        e.checked = false;
        return e;
      });
      this.setLoadingValueAction(false);
    },
    formatDate2(date) {
      console.log(date);
      let day = date.split("/")[1];
      let month = date.split("/")[0];
      let year = date.split("/")[2] == "24" ?
        "2024" :
        date.split("/")[2] == "25" ?
          "2025" :
          date.split("/")[2] == "23" ?
            "2023" :
            date.split("/")[2];
      let date2 = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` + "T00:00:00"); // Format mm/dd/yyyy or dd/mm/yyyy
      day = date2.getDate().toString().padStart(2, '0');
      month = (date2.getMonth() + 1).toString().padStart(2, '0');
      year = date2.getFullYear();
      return `${year}-${month}-${day}`;
    },
    formatDate3(time) {
      console.log(time);
      let hour = String(time.split(":")[0]).padStart(2, '0');
      let second = String(time.split(":")[1]).padStart(2, '0');

      return `${hour}:${second}`;
    },
    formatDate(date, isControlDate) {
      if (typeof date === 'string') {
        return date; // Assume it's already in correct format
      }

      if (date instanceof Date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return isControlDate ? `${month}/${day}/${year}` : `${day}/${month}/${year}`; // Format mm/dd/yyyy or dd/mm/yyyy
      }

      return date;
    },
    async doValidate() {
      const file = this.filesCantine.target.files[0];
      console.log("fff", file)
      if (file) {

        const reader = new FileReader();
        reader.onload = (e) => {
          this.setLoadingValueAction(true);
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });


          this.cantineTableHeaders = jsonData[0] || [];
          this.cantineTableData = jsonData
            .filter((row) => {
              return row[0] && row[0] != null && row[0] != ""
            })
            .slice(1)
            .map((row) => {

              return [
                row[0],
                row[1],
                this.formatDate2(row[2]),
                this.formatDate3(row[3]),
                row[4],
                row[5],
                row[6]
              ]
            });
          console.log(this.cantineTableData);
            axios.get('http://10.20.33.112:9017/api/consommateurs').then((e) => {

              this.desserts_consumers = e.data.map((e) => {
                e.checked = (e.checked == 1);
                return e;
              });
              console.log(e);
              let idsToPrevent = this.desserts_consumers
                .filter((e) => e.checked)
                .map((e) => {
                  return e.username;
                })
              axios.post('http://10.20.33.112:9015/pointage_to_json', { cantineTableData: this.cantineTableData, idsToPrevent: idsToPrevent })
                .then((response) => {
                  this.cantineTableAfterCheck = response.data.payload;
                  console.log("reponse :", response);
                  this.setLoadingValueAction(false);
                })
                .catch(() => {
                  this.setLoadingValueAction(false);
                });
            })
              .catch(() => {
              });




        };
        reader.readAsArrayBuffer(file);
      }
      //let date1 = "2024-07-01";
      //let date2 = "2024-08-01";


      //let login = { User: { login_id: "", password: "" } };


    },

    onFileChangeCantine(event) {
      this.filesCantine = event;
      //this.importFile(event, 'Cantine');
      //this.sendDataToBackend();
    },
    getMonthName(monthNumber) {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return monthNames[monthNumber - 1]; // Subtract 1 because arrays are 0-indexed
    },
    openAdd() {
      this.dialog_add_open = true;
    },
    saveYear(year) {
      this.$refs.menu.save(year)

      // Reset activePicker to type YEAR
      this.$refs.picker.activePicker = 'YEAR'

      // Close the menu/datepicker
    },
    setSelectedYear() {
      console.log("modalCaledarSelectedYear :", this.modalCaledarSelectedYear);
      this.showSelectYear = false;
    },
    openSelectYear() {
      this.showSelectYear = true;
    },
    openClearMsg(month) {
      this.selectedMonth = month;
      this.clearMSG = true;
    },
    async fetchMonthlyAnomalies() {
      this.setLoadingValueAction(true);
      this.anomalies = [];
      this.selectedYear = this.modalCaledarSelectedYear;
      try {

        axios.get('http://10.20.33.112:9017/api/consommations/anomalies/' + this.selectedYear)
          .then((e) => {
            console.log("this test tes :", e.data.payload);
            e.data.payload.map((c) => {
              this.anomalies.push({
                month: c.month + "/" + this.selectedYear,
                anomalies_count: c.countAnomalies,
                count: c.count,
              });
            });
            this.showSelectYear = false;
            this.setLoadingValueAction(false);
          })
          .catch(() => {
            this.setLoadingValueAction(false);
          });

        //const anomalyRequests = months.map(month =>
        //);
        //const responses = await Promise.all(anomalyRequests);
        //this.anomalies = responses.map((response, index) => ({
        //  month: `${index + 1}/${year}`, // Formater le mois/année
        //  anomalies_count: response.data.anomalies_count
        //}));
      } catch (error) {
        console.error('Erreur lors de la récupération des anomalies mensuelles:', error.message);
        // Afficher un message d'erreur dans l'interface utilisateur si nécessaire
        this.setLoadingValueAction(false);
      }
    },
    async viewMonthlyConsumption(month) {
      this.setLoadingValueAction(true);
      try {
        this.selectedMonth = month;
        await axios.get(`http://10.20.33.112:9017/api/consommations/month/${month}`)
          .then((e) => {
            this.consumption = e.data;
            this.dialog = true;
            this.setLoadingValueAction(false);
          })
          .catch(() => {
            this.setLoadingValueAction(false);
          });


      } catch (error) {
        console.error('Erreur lors de la récupération des consommations mensuelles:', error.message);
        // Afficher un message d'erreur dans l'interface utilisateur si nécessaire
        this.setLoadingValueAction(false);
      }
    },
    async clearMonthlyConsumption() {
      this.setLoadingValueAction(true);
      try {

        await axios.get(`http://10.20.33.112:9017/api/consommations/month/clear/${this.selectedMonth}`)
          .then(() => {
            this.clearMSG = false;
            this.clearMSGSuccess = true;
            this.fetchMonthlyAnomalies();
            this.setLoadingValueAction(false);
          })
          .catch(() => {
            this.setLoadingValueAction(false);
          });


      } catch (error) {
        console.error('Erreur lors de la récupération des consommations mensuelles:', error.message);
        // Afficher un message d'erreur dans l'interface utilisateur si nécessaire
        this.setLoadingValueAction(false);
      }
    },
    downloadExcel() {
      this.setLoadingValueAction(true);
      // Convertir les données en format Excel
      const ws = XLSX.utils.json_to_sheet(this.consumption.filter((e) => e.checked)
        .map((e) => {
          return {
            "ID": e.id,
            "MATRCULE": e.matricule,
            "nomPrenom": e.nomPrenom?.toLowerCase(),
            "DATE": e.date,
            "HOUT": e.heure,
            "DESCRIPTION": e.description,
            "QTE": e.qte,
            "AMOUNT": e.mt_sub,
            "ANOMALY": e.anomalie,
          }
        })
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Consommations-${this.selectedMonth}`);

      // Générer le fichier Excel et le télécharger
      XLSX.writeFile(wb, `CONSUMPTIONS-OF-MONTH-${this.selectedMonth}.xlsx`);
      this.setLoadingValueAction(false);
    }
  },
  mounted() {
    this.fetchMonthlyAnomalies();
    const date = new Date();
    const year = date.getFullYear();

    this.selectedYear = parseInt(year, 10);
    this.modalCaledarSelectedYear = parseInt(year, 10);
    let yearToBeging = this.selectedYear - 5;
    for (let index = 1; index < 20; index++) {
      this.items.push(
        yearToBeging + index
      )


    }
  },
  computed: {
    filteredItems() {
      return this.cantineTableAfterCheck.filter(item => {
        // convert search to lowercase and compare it with each item property
        const searchLowerCase = this.search.toLowerCase();
        return Object.keys(item).some(key =>
          String(item[key]).toLowerCase().includes(searchLowerCase)
        );
      });
    },
    filteredListConsrsl() {

      if (this.selectRadio == 'valid') {
        return this.cantineTableAfterCheck.filter((e) => {
          return e.anomalie == 'valid'
        });
      }
      else if (this.selectRadio == 'invalid') {
        return this.cantineTableAfterCheck.filter((e) => {
          return e.anomalie == 'invalid'
        });
      }
      else {
        return this.cantineTableAfterCheck;
      }

    },
    filteredListConsrs2() {

      if (this.selectRadio_2 == 'valid') {
        return this.consumption.filter((e) => {
          return e.anomalie == 'valid'
        });
      }
      else if (this.selectRadio_2 == 'invalid') {
        return this.consumption.filter((e) => {
          return e.anomalie == 'invalid'
        });
      }
      else {
        return this.consumption;
      }

    }
  }
};
</script>
<style>
.v-card {
  margin-bottom: 20px;
}

.notification-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  /* Prevents interaction with the container */
}

.notification {
  color: #fff;
  padding: 20px;
  border-radius: 5px;
  transition: all 1s ease, opacity 2s ease;
  opacity: 0;
  pointer-events: auto;
  height: 10px;
  padding-top: 3px;
  padding-bottom: 30px;
  min-width: 40%;
  margin-top: 11px;
  font-size: 17px;
  position: relative;
}

.notification.show {
  opacity: 1 !important;
}

.notification.hide {
  opacity: 0 !important;
}

.notification.sucess {
  background-color: rgba(48, 205, 124, 0.79);
}

.notification.Failed {
  background-color: rgb(205 48 48 / 79%);
}

.notification.Failed::after {
  content: "\F0D59";
  /* mdi-left-arrow icon */
  font-family: "Material Design Icons";
  /* Ensure this matches your mdi font family */
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  /* Adjust size as necessary */
  font-weight: 100 !important;
}

.notification.sucess::after {
  content: "\F0D59";
  /* mdi-left-arrow icon */
  font-family: "Material Design Icons";
  /* Ensure this matches your mdi font family */
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  /* Adjust size as necessary */
  font-weight: 100 !important;
}
</style>
