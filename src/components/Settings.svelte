<script lang="ts">
    export let title: string;
    export let description: string;
    export let value: boolean;
    export let supportedTypes: string[] = [];
    export let onChange: (value: boolean) => void;
  
    function handleChange() {
      value = !value;
      onChange(value);
    }
</script>

<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item-name">{title}</div>
        <div class="setting-item-description">{description}</div>
        {#if supportedTypes.length > 0}
        <div class="setting-item-supported-types">
            <div class="supported-types-label">Supported types:</div>
            <ul>
            {#each supportedTypes as type}
                <li>{type}</li>
            {/each}
            </ul>
        </div>
        {/if}
    </div>
    <div class="setting-item-control">
        <button 
        aria-label="Toggle setting"
        class="checkbox-container"
        on:click={handleChange}
        >
        <div class:is-enabled={value} class="checkbox">
            {#if value}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {/if}
        </div>
        </button>
    </div>
</div>
  
<style>
    .setting-item {
      display: flex;
      padding: 18px 0;
      border-top: 1px solid var(--background-modifier-border);
    }
  
    .setting-item-info {
      flex-grow: 1;
      margin-right: 16px;
    }
  
    .setting-item-name {
      font-size: var(--font-ui-medium);
      font-weight: var(--font-medium);
      margin-bottom: 6px;
    }
  
    .setting-item-description {
      font-size: var(--font-ui-small);
      color: var(--text-muted);
      margin-bottom: 8px;
    }
  
    .setting-item-supported-types {
      font-size: var(--font-ui-smaller);
      color: var(--text-muted);
      margin-top: 8px;
    }
  
    .supported-types-label {
      font-weight: var(--font-medium);
      margin-bottom: 4px;
    }
  
    ul {
      margin: 0;
      padding-left: 20px;
    }
  
    li {
      margin: 2px 0;
    }
  
    .setting-item-control {
      flex-shrink: 0;
      display: flex;
      align-items: flex-start;
    }
  
    .checkbox-container {
      background: none;
      padding: 0;
      border: none;
      cursor: pointer;
    }
  
    .checkbox {
      width: 16px;
      height: 16px;
      border: 2px solid var(--checkbox-border-color);
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.1s ease-in-out;
    }
  
    .checkbox.is-enabled {
      background-color: var(--interactive-accent);
      border-color: var(--interactive-accent);
    }
  
    .checkbox svg {
      width: 14px;
      height: 14px;
      color: var(--text-on-accent);
    }
</style>