<template>
    <div role="status" class="loading">
        <img src="@/assets/loading_gif.gif"
        alt="loading_gif"
        style="margin-bottom: 90px;"
        >
    </div>
</template>

<script>
/* eslint-disable vue/multi-word-component-names */
export default {
    name: 'LoadingIndicator', 
}
</script>

<style>
.loading{
    position: absolute;
    z-index: 30;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: end;
    background-color: rgba(0, 0, 0, 0.5);

}
</style>
