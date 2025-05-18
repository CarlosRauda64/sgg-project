// js/cesium.js

// --- Configuración del Token de Cesium Ion ---
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NDRkNWVhNy0zZDUzLTRhMjctODM2Yy1mOGRiMjQwMzllNzEiLCJpZCI6MzAxNTU3LCJpYXQiOjE3NDcwMTE4MDF9.yJhtoi6X8NYz8YGp_79DMymdNxXpt7UIbQet3bwUNSY';

// --- Constantes Globales ---
const geoServerWorkspace = 'SGG'; // Tu workspace de GeoServer
const geoServerWmsUrl = `https://geo.sggproject.me/geoserver/${geoServerWorkspace}/wms`; // URL para WMS

const divisionesAdministrativas = { // Tu estructura de divisiones
    "Ahuachapán": { municipios: { "Ahuachapán Centro": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"], "Ahuachapán Norte": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"], "Ahuachapán Sur": ["Guaymango", "Jujutla", "San Francisco Menéndez", "San Pedro Puxtla"]}},
    "Santa Ana": { municipios: { "Santa Ana Centro": ["Santa Ana"], "Santa Ana Este": ["Coatepeque", "El Congo"], "Santa Ana Norte": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"], "Santa Ana Oeste": ["Candelaria de la Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de la Frontera"]}},
    "La Libertad": { municipios: { "La Libertad Centro": ["Ciudad Arce", "San Juan Opico"], "La Libertad Costa": ["Chiltiupán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"], "La Libertad Este": ["Antiguo Cuscatlán", "Huizúcar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"], "La Libertad Norte": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"], "La Libertad Oeste": ["Colón", "Jayaque", "Sacacoyo", "Talnique", "Tepecoyo"], "La Libertad Sur": ["Comasagua", "Santa Tecla"]}},
    "San Salvador": { municipios: { "San Salvador Centro": ["Ayutuxtepeque", "Delgado", "Cuscatancingo", "Mejicanos", "San Salvador"], "San Salvador Este": ["Ilopango", "San Martín", "Soyapango", "Tonacatepeque"], "San Salvador Norte": ["Aguilares", "El Paisnal", "Guazapa"], "San Salvador Oeste": ["Apopa", "Nejapa"], "San Salvador Sur": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santiago Texacuangos", "Santo Tomás"]}},
    "Usulután": { municipios: { "Usulután Este": ["California", "Concepción Batres", "Ereguayquín", "Jucuarán", "Ozatlán", "San Dionisio", "Santa Elena", "Santa María", "Tecapán", "Usulután"], "Usulután Norte": ["Alegría", "Berlín", "El Triunfo", "Estanzuelas", "Jucuapa", "Mercedes Umaña", "Nueva Granada", "San Buenaventura", "Santiago de María"], "Usulután Oeste": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"]}},
    "San Miguel": { municipios: { "San Miguel Centro": ["Chirilagua", "Comacarán", "Moncagua", "Quelepa", "San Miguel", "Uluazapa"], "San Miguel Norte": ["Carolina", "Chapeltique", "Ciudad Barrios", "Nuevo Edén de San Juan", "San Antonio", "San Gerardo", "San Luis de la Reina", "Sesori"], "San Miguel Oeste": ["Chinameca", "El Tránsito", "Lolotique", "Nueva Guadalupe", "San Jorge", "San Rafael"]}}
};

// Referencias a Elementos del DOM
const departamentoSelectGlobal = document.getElementById('departamentoSelectGlobal');
const municipioSelectGlobal = document.getElementById('municipioSelectGlobal');
const distritoSelectGlobal = document.getElementById('distritoSelectGlobal');
const deburgaSelectGlobal = document.getElementById('deburgaSelectGlobal');
const resetFiltersButton = document.getElementById('resetFiltersButton');

// --- Definición de Capas para CesiumJS con zIndex ---
const cesiumLayersConfig = {
    // --- CAPAS RÁSTER (zIndex más bajos) ---
    superficie:     { name: `${geoServerWorkspace}:superficie`,     title: 'Superficie',        imageryLayer: null, toggleId: 'toggleSuperficie',   currentFilter: "INCLUDE", type: 'raster', legend: false, zIndex: 0 },
    temperatura:    { name: `${geoServerWorkspace}:temperatura`,    title: 'Temperatura (LST)', imageryLayer: null, toggleId: 'toggleTemperatura',  currentFilter: "INCLUDE", type: 'raster', legend: true,  zIndex: 5 }, // Elevado para asegurar que esté sobre otras temáticas si se activan juntas por error
    vegetacion:     { name: `${geoServerWorkspace}:vegetacion`,     title: 'Vegetación (NDVI)', imageryLayer: null, toggleId: 'toggleVegetacion',   currentFilter: "INCLUDE", type: 'raster', legend: true,  zIndex: 4 },
    suelos:         { name: `${geoServerWorkspace}:Uso de Suelo`,   title: 'Uso de Suelo',      imageryLayer: null, toggleId: 'toggleSuelos',       currentFilter: "INCLUDE", type: 'raster', legend: true,  zIndex: 3 },

    // --- CAPAS VECTORIALES (zIndex más altos, se dibujan encima de los rásters) ---
    // El orden aquí es de abajo hacia arriba en el apilamiento visual
    // Cambié los nombres de 'departamento', 'municipios', 'distrito' para que coincidan con los toggleId si es necesario.
    // Si tus toggleId son 'toggleDepartamento', 'toggleMunicipios', 'toggleDistrito', mantén esas claves.
    // Aquí uso las claves que ya tenías en tu config original.
    departamento:   { name: `${geoServerWorkspace}:departamento`,   title: 'Departamentos',     imageryLayer: null, toggleId: 'toggleDepartamento', filterField: 'adm1_es', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 10 },
    municipios:     { name: `${geoServerWorkspace}:municipio`,      title: 'Municipios',        imageryLayer: null, toggleId: 'toggleMunicipios',   filterField: 'adm2_es', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 11 },
    distrito:       { name: `${geoServerWorkspace}:distrito`,       title: 'Distritos',         imageryLayer: null, toggleId: 'toggleDistrito',     filterField: 'adm3_es', currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 12 },
    cuerposAgua:    { name: `${geoServerWorkspace}:cuerposAgua`,    title: 'Cuerpos de Agua',   imageryLayer: null, toggleId: 'toggleCuerpos',      currentFilter: "INCLUDE", type: 'vector', legend: true,  zIndex: 13 },
    deburga:        { name: `${geoServerWorkspace}:deburga`,        title: 'DEGURBA',           imageryLayer: null, toggleId: 'toggleDeburga',      filterField: 'class',   currentFilter: "INCLUDE", type: 'vector', legend: true,  zIndex: 14 },
    construcciones: { name: `${geoServerWorkspace}:construcciones`, title: 'Construcciones',    imageryLayer: null, toggleId: 'toggleConstrucciones',currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 15 },
    rios:           { name: `${geoServerWorkspace}:rios`,           title: 'Ríos',              imageryLayer: null, toggleId: 'toggleRios',         currentFilter: "INCLUDE", type: 'vector', legend: true,  zIndex: 16 },
    carreteras:     { name: `${geoServerWorkspace}:carreteras`,     title: 'Carreteras',        imageryLayer: null, toggleId: 'toggleCarreteras',   currentFilter: "INCLUDE", type: 'vector', legend: false, zIndex: 17 }
};

let viewer; // Variable global para el visor de Cesium

async function initializeCesiumApp() {
    let terrainProviderInstance;
    try {
        terrainProviderInstance = await Cesium.createWorldTerrainAsync({
            requestWaterMask: true,
            requestVertexNormals: true
        });
    } catch (error) {
        console.error("Error al crear el proveedor de terreno:", error);
        alert("Error al cargar el terreno mundial. Verifique su token de Cesium Ion y la conexión a internet.");
        terrainProviderInstance = undefined;
    }

    try {
        viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: terrainProviderInstance,
            animation: false,
            timeline: false,
            homeButton: true,
            sceneModePicker: true,
            baseLayerPicker: true,
            geocoder: false,
            navigationHelpButton: false,
            infoBox: true,
        });
        console.log("Visor de CesiumJS inicializado.");

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(-89.2182, 13.6929, 400000), // El Salvador
            orientation: { heading: Cesium.Math.toRadians(0.0), pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
        });

    } catch (viewerError) {
        console.error("Error al inicializar el Cesium.Viewer:", viewerError);
        alert("Error crítico al inicializar el visor de Cesium. Revisa la consola.");
        return;
    }

    setupEventListeners();
    applyInitialLayerVisibility();
}

function createWMSImageryProvider(layerName, cqlFilter = "INCLUDE") {
    return new Cesium.WebMapServiceImageryProvider({
        url: geoServerWmsUrl,
        layers: layerName,
        parameters: {
            transparent: true,
            format: 'image/png',
            CQL_FILTER: cqlFilter,
            VERSION: '1.1.1',
        },
        enablePickFeatures: true
    });
}

/**
 * Re-evalúa y re-aplica todas las capas visibles en el orden correcto de zIndex.
 */
function updateAllVisibleLayersOrder() {
    if (!viewer) return;

    const layersToShow = [];
    // Primero, desvincular y preparar la lista de capas a mostrar
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggleCheckbox = document.getElementById(config.toggleId);

        // Si la capa existía, la desvinculamos para luego removerla del viewer
        if (config.imageryLayer) {
            // No es necesario removerla aquí aun, solo desvincularla de nuestra config.
            // Se removerán todas las capas gestionadas del viewer más adelante.
        }

        if (toggleCheckbox && toggleCheckbox.checked) {
            layersToShow.push({
                key: key, // Clave de nuestra configuración
                name: config.name, // Nombre de la capa en GeoServer
                filter: config.currentFilter,
                zIndex: config.zIndex !== undefined ? config.zIndex : 0, // Usar zIndex definido, o 0 por defecto
                // instance: null // No es necesario aquí, se asignará al añadir
            });
        }
    }

    // Ordenar las capas a mostrar por su zIndex (menor a mayor)
    layersToShow.sort((a, b) => a.zIndex - b.zIndex);

    // Remover todas las capas gestionadas existentes del visor de forma segura
    // Iteramos sobre una copia de las imageryLayers porque la colección se modifica
    const imageryLayersCopy = [...viewer.imageryLayers._layers]; 
    imageryLayersCopy.forEach(layerInstance => {
        // Verificamos si esta instancia es una de nuestras capas gestionadas
        const managedKey = Object.keys(cesiumLayersConfig).find(key => cesiumLayersConfig[key].imageryLayer === layerInstance);
        if (managedKey) {
            viewer.imageryLayers.remove(layerInstance, true); // true para destruir el proveedor
            cesiumLayersConfig[managedKey].imageryLayer = null; // Asegurar desvinculación en config
        }
    });
    
    // Añadir las capas ordenadas al visor.
    // Cesium las añade por defecto encima, así que al iterar nuestra lista ordenada por zIndex (menor a mayor),
    // la capa con zIndex más bajo se añade primero (al fondo de este lote), y la de zIndex más alto se añade al final (encima de este lote).
    layersToShow.forEach(layerData => {
        const provider = createWMSImageryProvider(layerData.name, layerData.filter);
        const cesiumLayer = viewer.imageryLayers.addImageryProvider(provider);
        // Guardar la referencia a la instancia de Cesium.ImageryLayer en nuestra configuración
        cesiumLayersConfig[layerData.key].imageryLayer = cesiumLayer;
    });
}


function displayIndividualLayerLegend(layerKey) {
    const config = cesiumLayersConfig[layerKey];
    const legendContentDiv = document.getElementById(`legend-content-${layerKey}`);

    if (!config || !legendContentDiv || !config.legend) {
        if (legendContentDiv) legendContentDiv.innerHTML = '';
        return;
    }

    legendContentDiv.innerHTML = '<p class="text-xs text-gray-400 italic">Cargando leyenda...</p>';
    const layerName = config.name;

    let legendOptionsArray = [
        "fontName:SansSerif", "fontSize:10", "fontAntiAliasing:true",
        "forceLabels:on", "labelMargin:2", "dx:0.2", "dy:0.2", "mx:0.2", "my:0.2",
        "border:false",
    ];
    
    // if (layerKey === 'rios' || layerKey === 'cuerposAgua' || layerKey === 'deburga') {
    //    // specificLegendOptions.push("fontSize:9"); // Ejemplo
    // }


    const legendOptionsString = legendOptionsArray.join(';');
    const imageWidth = 120; 
    const imageHeight = ""; 

    const legendUrl = `${geoServerWmsUrl}?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&LAYER=${layerName}&STYLE=` +
                      `&WIDTH=${imageWidth}` +
                      (imageHeight ? `&HEIGHT=${imageHeight}` : '') +
                      `&LEGEND_OPTIONS=${encodeURIComponent(legendOptionsString)}`;

    console.log(`Legend URL for ${layerKey}:`, legendUrl);

    const img = document.createElement('img');
    img.src = legendUrl;
    img.alt = `Leyenda ${config.title}`;

    img.onload = function() {
        legendContentDiv.innerHTML = '';
        legendContentDiv.appendChild(img);
    };
    img.onerror = function() {
        console.error(`Error al cargar la leyenda para: ${layerName} desde ${legendUrl}`);
        legendContentDiv.innerHTML = `<p class="text-xs text-red-400 italic">Leyenda no disp.</p>`;
    };
}

function setupEventListeners() {
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggleCheckbox = document.getElementById(config.toggleId);
        const legendInfoButton = document.querySelector(`.legend-info-btn[data-layerkey="${key}"]`);
        const legendContentDiv = document.getElementById(`legend-content-${key}`);

        if (toggleCheckbox) {
            toggleCheckbox.addEventListener('change', (event) => {
                const isChecked = event.target.checked;
                // La lógica de añadir/quitar capas se centraliza en updateAllVisibleLayersOrder
                // y en manejarActivacionRaster que también la llamará.

                if (config.type === 'raster' && ['temperatura', 'vegetacion', 'suelos', 'superficie'].includes(key)) {
                    manejarActivacionRaster(key, isChecked); // Esto llamará a updateAllVisibleLayersOrder
                } else {
                    updateAllVisibleLayersOrder(); // Para capas vectoriales o no temáticas
                }

                if (config.legend && legendInfoButton) {
                    legendInfoButton.style.display = isChecked ? 'inline-block' : 'none';
                    if (!isChecked && legendContentDiv) {
                        legendContentDiv.style.display = 'none';
                        legendContentDiv.innerHTML = '';
                        legendInfoButton.classList.remove('active');
                    }
                }
            });
        }

        if (config.legend && legendInfoButton && legendContentDiv) {
            legendInfoButton.addEventListener('click', () => {
                const isLegendVisible = legendContentDiv.style.display === 'block';
                if (isLegendVisible) {
                    legendContentDiv.style.display = 'none';
                    legendInfoButton.classList.remove('active');
                } else {
                    legendContentDiv.style.display = 'block';
                    legendInfoButton.classList.add('active');
                    displayIndividualLayerLegend(key);
                }
            });
        }
    }

    if (departamentoSelectGlobal) {
        departamentoSelectGlobal.addEventListener('change', function() {
            populateMunicipioSelect(this.value);
            applyAllFilters();
        });
    }
    if (municipioSelectGlobal) {
        municipioSelectGlobal.addEventListener('change', function() {
            populateDistritoSelect(departamentoSelectGlobal.value, this.value);
            applyAllFilters();
        });
    }
    if (distritoSelectGlobal) distritoSelectGlobal.addEventListener('change', applyAllFilters);
    if (deburgaSelectGlobal) deburgaSelectGlobal.addEventListener('change', applyAllFilters);
    if (resetFiltersButton) resetFiltersButton.addEventListener('click', resetAllFilters);
}

function applyInitialLayerVisibility() {
    updateAllVisibleLayersOrder(); // Carga inicial con orden correcto

    // Actualizar visibilidad de botones de leyenda después de cargar capas
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggleCheckbox = document.getElementById(config.toggleId);
        const legendInfoButton = document.querySelector(`.legend-info-btn[data-layerkey="${key}"]`);
        if (toggleCheckbox && legendInfoButton && config.legend) {
            legendInfoButton.style.display = toggleCheckbox.checked ? 'inline-block' : 'none';
        }
    }
    // No es necesario llamar a manejarActivacionRaster aquí si updateAll ya consideró los checkboxes.
    // O si se llama, asegurarse que no cause doble actualización.
    // La llamada inicial a manejarActivacionRaster es para establecer el `activeRasterLayerKey` si es necesario.
    // Quizás una llamada sin parámetros para solo inicializar su estado interno:
    manejarActivacionRaster(null, false); 
}

function populateMunicipioSelect(departamentoNombre) {
    municipioSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
    distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
    distritoSelectGlobal.disabled = true;
    distritoSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    distritoSelectGlobal.classList.remove('bg-white');

    if (departamentoNombre && divisionesAdministrativas[departamentoNombre]) {
        const dataDepartamento = divisionesAdministrativas[departamentoNombre];
        if (dataDepartamento && dataDepartamento.municipios) {
            for (const municipioNombre in dataDepartamento.municipios) {
                const option = document.createElement('option');
                option.value = municipioNombre;
                option.textContent = municipioNombre;
                municipioSelectGlobal.appendChild(option);
            }
            municipioSelectGlobal.disabled = false;
            municipioSelectGlobal.classList.remove('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
            municipioSelectGlobal.classList.add('bg-white');
        } else {
            municipioSelectGlobal.disabled = true;
            municipioSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        }
    } else {
        municipioSelectGlobal.disabled = true;
        municipioSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    }
}

function populateDistritoSelect(departamentoNombre, municipioNombre) {
    distritoSelectGlobal.innerHTML = '<option value="">-- Seleccione --</option>';
    if (departamentoNombre && municipioNombre &&
        divisionesAdministrativas[departamentoNombre] &&
        divisionesAdministrativas[departamentoNombre].municipios &&
        divisionesAdministrativas[departamentoNombre].municipios[municipioNombre]) {
        
        const distritos = divisionesAdministrativas[departamentoNombre].municipios[municipioNombre];
        distritos.forEach(distritoNombre => {
            const option = document.createElement('option');
            option.value = distritoNombre;
            option.textContent = distritoNombre;
            distritoSelectGlobal.appendChild(option);
        });
        distritoSelectGlobal.disabled = false;
        distritoSelectGlobal.classList.remove('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
        distritoSelectGlobal.classList.add('bg-white');
    } else {
        distritoSelectGlobal.disabled = true;
        distritoSelectGlobal.classList.add('bg-gray-100', 'cursor-not-allowed', 'opacity-70');
    }
}

function applyAllFilters() {
    const depSelected = departamentoSelectGlobal.value;
    const munSelected = municipioSelectGlobal.value;
    const disSelected = distritoSelectGlobal.value;
    const debSelected = deburgaSelectGlobal.value;

    // Solo actualizamos el currentFilter. La actualización visual la hará updateAllVisibleLayersOrder.
    if (cesiumLayersConfig.departamento) { // Asegúrate que la clave coincida con tu config
        cesiumLayersConfig.departamento.currentFilter = depSelected ? `${cesiumLayersConfig.departamento.filterField} = '${depSelected}'` : "INCLUDE";
    }
    if (cesiumLayersConfig.municipios) {
        let cqlMun = "INCLUDE";
        if (depSelected) {
            cqlMun = `adm1_es = '${depSelected}'`; 
            if (munSelected) cqlMun += ` AND ${cesiumLayersConfig.municipios.filterField} = '${munSelected}'`;
        }
        cesiumLayersConfig.municipios.currentFilter = cqlMun;
    }
    if (cesiumLayersConfig.distrito) {
        let cqlDis = "INCLUDE";
        if (depSelected) {
            cqlDis = `adm1_es = '${depSelected}'`;
            if (munSelected) {
                cqlDis += ` AND adm2_es = '${munSelected}'`;
                if (disSelected) cqlDis += ` AND ${cesiumLayersConfig.distrito.filterField} = '${disSelected}'`;
            }
        }
        cesiumLayersConfig.distrito.currentFilter = cqlDis;
    }
    if (cesiumLayersConfig.deburga) {
        cesiumLayersConfig.deburga.currentFilter = debSelected ? `${cesiumLayersConfig.deburga.filterField} = '${debSelected}'` : "INCLUDE";
    }
    updateAllVisibleLayersOrder();
}

function resetAllFilters() {
    if (departamentoSelectGlobal) departamentoSelectGlobal.value = "";
    populateMunicipioSelect(""); 
    if (deburgaSelectGlobal) deburgaSelectGlobal.value = "";

    ['departamento', 'municipios', 'distrito', 'deburga'].forEach(key => {
        if (cesiumLayersConfig[key]) {
            cesiumLayersConfig[key].currentFilter = "INCLUDE";
        }
    });
    
    updateAllVisibleLayersOrder();
    
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-89.2182, 13.6929, 400000),
        orientation: { heading: Cesium.Math.toRadians(0.0), pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
    });
}

let activeRasterLayerKey = null;
const thematicRasterKeys = ['temperatura', 'vegetacion', 'suelos']; // Asegúrate que estas claves coincidan con cesiumLayersConfig

function manejarActivacionRaster(changedLayerKey, isChecked) {
    const superficieConfig = cesiumLayersConfig.superficie; // Usar config
    const superficieChk = document.getElementById(superficieConfig.toggleId);
    let needsLayerReorder = false;

    if (changedLayerKey && (thematicRasterKeys.includes(changedLayerKey) || changedLayerKey === 'superficie')) {
        needsLayerReorder = true; // Asumimos que un cambio en estas capas requerirá reordenar

        if (thematicRasterKeys.includes(changedLayerKey)) { // Si se cambió una capa temática
            if (isChecked) {
                activeRasterLayerKey = changedLayerKey;
                // Desactivar otras capas temáticas
                thematicRasterKeys.forEach(key => {
                    if (key !== changedLayerKey) {
                        const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
                        if (chk && chk.checked) {
                            chk.checked = false; // Esto NO disparará su evento 'change' desde aquí
                                                 // así que debemos manejar la UI de su leyenda manualmente
                            const legendBtn = document.querySelector(`.legend-info-btn[data-layerkey="${key}"]`);
                            const legendDiv = document.getElementById(`legend-content-${key}`);
                            if (legendBtn) legendBtn.style.display = 'none';
                            if (legendDiv) { legendDiv.style.display = 'none'; legendDiv.innerHTML = '';}
                            if (legendBtn) legendBtn.classList.remove('active');
                        }
                    }
                });
                // Activar 'superficie' si no está activa
                if (superficieChk && !superficieChk.checked) {
                    superficieChk.checked = true;
                }
            } else { // Si se desactiva la capa temática que estaba activa
                if (activeRasterLayerKey === changedLayerKey) {
                    activeRasterLayerKey = null;
                    // Si no hay otra temática activa, desactivar 'superficie' (solo si fue activada automáticamente)
                    // Esta lógica puede ser compleja, por ahora, se desactiva si es la única
                    const algunaOtraTematicaActiva = thematicRasterKeys.some(key => {
                        const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
                        return chk && chk.checked;
                    });
                    if (!algunaOtraTematicaActiva && superficieChk && superficieChk.checked) {
                        superficieChk.checked = false;
                    }
                }
            }
        } else if (changedLayerKey === 'superficie') { // Si se cambió la capa 'superficie'
            if (!isChecked && activeRasterLayerKey) { // Si se intenta desactivar 'superficie' y hay una temática activa
                if(superficieChk) superficieChk.checked = true; // Forzar a que siga activa
                alert("La capa 'Superficie' es necesaria mientras una capa ráster temática esté activa.");
                needsLayerReorder = false; // No hubo cambio real, no reordenar
            }
        }
    }

    // Llamar a reordenar si es necesario o es la llamada inicial de la página
    if (needsLayerReorder || changedLayerKey === null) {
        updateAllVisibleLayersOrder();
    }
}

document.addEventListener('DOMContentLoaded', initializeCesiumApp);