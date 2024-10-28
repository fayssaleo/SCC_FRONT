<template>
  <v-app>
    <div>
        <LoadingIndicator v-if="getLoadingValue" />
      </div>
    <div :class="layoutClass">
      <!-- Navigation Drawer -->
      <v-navigation-drawer v-if="!isLoginPage" v-model="drawer" :mini-variant="miniVariant" @click:append="hideDrawer"
        class="navigation-drawer">
        <v-list style="height: 100%; position: relative;">
          <v-list-item>
            <v-img class="sideBarLog logo" :src="logo" contain />
          </v-list-item>
          <v-list-item @click="navigateTo('HomePage')" class="nav-item" :style="{
            color: '#F9FBFC',
            backgroundColor: 'HomePage' == $route.name
              ? 'rgba(217, 217, 217, 0.2)'
              : '',
          }" prepend-icon="mdi-view-dashboard" title="DASHBOARD">

          </v-list-item>
          <v-list-item @click="navigateTo('VerificationTable')" class="nav-item" :style="{
            color: '#F9FBFC',
            backgroundColor: 'VerificationTable' == $route.name
              ? 'rgba(217, 217, 217, 0.2)'
              : '',
          }"
          prepend-icon="mdi-tab-search" title="VERIFICATIONS TABLE"
          >
          

          </v-list-item>
          <v-spacer></v-spacer>
          <v-list-item @click="logout" class="nav-item deco"
          prepend-icon="mdi-logout" title="LOGOUT"
          >

          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- App Bar -->
      <v-app-bar class="navbar_" v-if="!isLoginPage" style="    background-color: #1e2855; color: white;">
        <v-app-bar-nav-icon @click="toggleDrawer" class="nav-icon">
          <v-icon class="menu-icon">mdi-menu</v-icon>
        </v-app-bar-nav-icon>

        <v-toolbar-title class="headline">SCC</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-app-bar>

      <!-- Main Content -->
      <v-main>
        <v-container>
          <router-view />
        </v-container>
      </v-main>
    </div>
  </v-app>
</template>

<script>
import axios from 'axios';
import logo from '@/assets/logo-white.svg';
import { mapGetters, mapActions } from "vuex";
import LoadingIndicator from "@/components/LoadingPage.vue";
export default {
  components: {  LoadingIndicator },
  data() {
    return {
      drawer: false,
      miniVariant: false,
      logo
    };
  },
  computed: {
    ...mapGetters(["getLoadingValue"]),

    pageTitle() {
      return this.$route.meta.title || 'Application';
    },
    isLoginPage() {
      return this.$route.path === '/'; // Change if necessary to match your login route
    },
    layoutClass() {
      return this.isLoginPage ? 'login-layout' : 'default-layout';
    }
  },
  methods: {
    ...mapActions([
      "setLoadingValueAction",
    ]),
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    hideDrawer() {
      this.drawer = false;
    },
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
      this.hideDrawer();
    },
    async logout() {
      try {
        const token = this.$store.state.token || localStorage.getItem('token');
        console.log('Token:', token);

        const response = await axios.post('http://10.20.33.112:9017/api/users/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Logout response:', response);

        this.$store.commit('setToken', null);
        localStorage.removeItem('token');
        this.$router.push('/');
      } catch (error) {
        console.error('Erreur lors de la déconnexion :', error.response || error.message || error);
      }
    }
  }
};
</script>

<style scoped>
.default-layout {
  /* Styles pour la mise en page par défaut */
}

.login-layout {
  /* Styles spécifiques à la mise en page de la connexion */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  /* Couleur de fond spécifique */
}

.logo {
  width: 100%;
  height: auto;
}

.menu-icon {
  color: #1976D2;
}

.navigation-drawer {
  background-color: #15263f;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

.nav-content {
  margin-left: 3px;
  display: flex;
  align-items: center;
}

.nav-title {
  white-space: nowrap;
  color: white;
  font-weight: 700;
}
</style>
