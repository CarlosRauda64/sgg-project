// js/cesium.js

// --- Configuración del Token de Cesium Ion ---
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NDRkNWVhNy0zZDUzLTRhMjctODM2Yy1mOGRiMjQwMzllNzEiLCJpZCI6MzAxNTU3LCJpYXQiOjE3NDcwMTE4MDF9.yJhtoi6X8NYz8YGp_79DMymdNxXpt7UIbQet3bwUNSY'; // ¡¡¡REEMPLAZA CON TU TOKEN!!!

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

// --- Definición de Capas para CesiumJS ---
const cesiumLayersConfig = {
    superficie:     { name: `${geoServerWorkspace}:superficie`,     title: 'Superficie',        imageryLayer: null, toggleId: 'toggleSuperficie',   currentFilter: "INCLUDE", type: 'raster', legend: false },
    suelos:         { name: `${geoServerWorkspace}:Uso de Suelo`,   title: 'Uso de Suelo',      imageryLayer: null, toggleId: 'toggleSuelos',       currentFilter: "INCLUDE", type: 'raster', legend: true },
    vegetacion:     { name: `${geoServerWorkspace}:vegetacion`,     title: 'Vegetación (NDVI)', imageryLayer: null, toggleId: 'toggleVegetacion',   currentFilter: "INCLUDE", type: 'raster', legend: true },
    temperatura:    { name: `${geoServerWorkspace}:temperatura`,    title: 'Temperatura (LST)', imageryLayer: null, toggleId: 'toggleTemperatura',  currentFilter: "INCLUDE", type: 'raster', legend: true },
    departamento:   { name: `${geoServerWorkspace}:departamento`,   title: 'Departamentos',     imageryLayer: null, toggleId: 'toggleDepartamento', filterField: 'adm1_es', currentFilter: "INCLUDE", type: 'vector', legend: false },
    municipios:     { name: `${geoServerWorkspace}:municipio`,      title: 'Municipios',        imageryLayer: null, toggleId: 'toggleMunicipios',   filterField: 'adm2_es', currentFilter: "INCLUDE", type: 'vector', legend: false },
    distrito:       { name: `${geoServerWorkspace}:distrito`,       title: 'Distritos',         imageryLayer: null, toggleId: 'toggleDistrito',     filterField: 'adm3_es', currentFilter: "INCLUDE", type: 'vector', legend: false },
    cuerposAgua:    { name: `${geoServerWorkspace}:cuerposAgua`,    title: 'Cuerpos de Agua',   imageryLayer: null, toggleId: 'toggleCuerpos',      currentFilter: "INCLUDE", type: 'vector', legend: true },
    deburga:        { name: `${geoServerWorkspace}:deburga`,        title: 'DEGURBA',           imageryLayer: null, toggleId: 'toggleDeburga',      filterField: 'class',   currentFilter: "INCLUDE", type: 'vector', legend: true },
    construcciones: { name: `${geoServerWorkspace}:construcciones`, title: 'Construcciones',    imageryLayer: null, toggleId: 'toggleConstrucciones',currentFilter: "INCLUDE", type: 'vector', legend: false },
    rios:           { name: `${geoServerWorkspace}:rios`,           title: 'Ríos',              imageryLayer: null, toggleId: 'toggleRios',         currentFilter: "INCLUDE", type: 'vector', legend: true },
    carreteras:     { name: `${geoServerWorkspace}:carreteras`,     title: 'Carreteras',        imageryLayer: null, toggleId: 'toggleCarreteras',   currentFilter: "INCLUDE", type: 'vector', legend: false }
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

function refreshCesiumWMSLayer(layerKey, isVisible, newCqlFilter) {
    const layerConfig = cesiumLayersConfig[layerKey];
    if (!layerConfig) return;

    if (layerConfig.imageryLayer) {
        viewer.imageryLayers.remove(layerConfig.imageryLayer, true);
        layerConfig.imageryLayer = null;
    }

    if (newCqlFilter !== undefined) {
        layerConfig.currentFilter = newCqlFilter;
    }

    if (isVisible) {
        const provider = createWMSImageryProvider(layerConfig.name, layerConfig.currentFilter);
        layerConfig.imageryLayer = viewer.imageryLayers.addImageryProvider(provider);
    }
}

/**
 * Obtiene y muestra la leyenda para una capa específica usando LEGEND_OPTIONS.
 */
function displayIndividualLayerLegend(layerKey) {
    const config = cesiumLayersConfig[layerKey];
    const legendContentDiv = document.getElementById(`legend-content-${layerKey}`);

    if (!config || !legendContentDiv || !config.legend) {
        if (legendContentDiv) legendContentDiv.innerHTML = '';
        return;
    }

    legendContentDiv.innerHTML = '<p class="text-xs text-gray-400 italic">Cargando leyenda...</p>';

    const layerName = config.name;

    // --- Configuración de LEGEND_OPTIONS y tamaño de imagen ---
    let legendOptionsArray = [
        "fontName:SansSerif", // GeoServer puede tener alias como 'SansSerif', 'Serif', 'Monospaced'
        "fontSize:15",        // Reducir tamaño de fuente. Prueba con 8, 9, 10.
        "fontAntiAliasing:true",
        // "fontStyle:bold", // Opcional
        // "fontColor:0x333333", // Opcional: color de fuente en hexadecimal
        "forceLabels:on",
        "labelMargin:3",      // Margen entre el gráfico y la etiqueta (reducido)
        "dx:0.1",             // Espaciado horizontal general (reducido)
        "dy:0.1",             // Espaciado vertical general (reducido)
        "mx:0.1",             // Margen horizontal entre elementos de leyenda (reducido)
        "my:0.1",             // Margen vertical entre elementos de leyenda (reducido)
        "border:false",       // Quitar borde alrededor de la leyenda completa
        "borderColor:0x000000",
        "borderWidth:0",
        "dpi:91", // Ligeramente mayor DPI para posible mejora de nitidez en texto pequeño
        "rowwidth:10", // Si tienes items muy anchos y quieres forzar que se acorten.
    ];

    // Opciones específicas por tipo de capa o capa individual si es necesario
    if (config.type === 'raster') { // Para LST, NDVI
        legendOptionsArray.push("item뮐านา:false", "fontSize:20"); // Para rásters, a veces se añaden items extra no deseados
        
    }
    


    const legendOptionsString = legendOptionsArray.join(';');

    const imageWidth = 100; // Ancho deseado para la imagen de leyenda (más estrecho)
    const imageHeight = "";   // Dejar vacío para que GeoServer calcule la altura basado en contenido y otras opciones

    const legendUrl = `${geoServerWmsUrl}?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&LAYER=${layerName}&STYLE=` +
                      `&WIDTH=${imageWidth}` +
                      (imageHeight ? `&HEIGHT=${imageHeight}` : '') +
                      `&LEGEND_OPTIONS=${encodeURIComponent(legendOptionsString)}`;

    console.log(`Legend URL for ${layerKey}:`, legendUrl); // Para depuración

    const img = document.createElement('img');
    img.src = legendUrl;
    img.alt = `Leyenda ${config.title}`;
    // Los estilos de la imagen (max-width, max-height, object-fit) se manejan por CSS en index.html

    img.onload = function() {
        legendContentDiv.innerHTML = '';
        legendContentDiv.appendChild(img);
    };
    img.onerror = function() {
        console.error(`Error al cargar la leyenda para: ${layerName} desde ${legendUrl}`);
        legendContentDiv.innerHTML = `<p class="text-xs text-red-400 italic">Leyenda no disponible para ${config.title}.</p>`;
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
                refreshCesiumWMSLayer(key, isChecked);

                if (config.legend && legendInfoButton) {
                    legendInfoButton.style.display = isChecked ? 'inline-block' : 'none';
                    if (!isChecked && legendContentDiv) {
                        legendContentDiv.style.display = 'none';
                        legendContentDiv.innerHTML = ''; // Limpiar contenido al ocultar
                        legendInfoButton.classList.remove('active');
                    }
                }

                if (config.type === 'raster' && ['temperatura', 'vegetacion', 'suelos'].includes(key)) {
                    manejarActivacionRaster(key, isChecked);
                }
            });
        }

        if (config.legend && legendInfoButton && legendContentDiv) {
            legendInfoButton.addEventListener('click', () => {
                const isLegendVisible = legendContentDiv.style.display === 'block';
                if (isLegendVisible) {
                    legendContentDiv.style.display = 'none';
                    legendInfoButton.classList.remove('active');
                    // No es necesario limpiar el contenido aquí, se recargará si se vuelve a abrir.
                } else {
                    legendContentDiv.style.display = 'block';
                    legendInfoButton.classList.add('active');
                    // Cargar la leyenda. Se recargará cada vez que se abra para reflejar cambios de estilo/opciones.
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
    for (const key in cesiumLayersConfig) {
        const config = cesiumLayersConfig[key];
        const toggleCheckbox = document.getElementById(config.toggleId);
        const legendInfoButton = document.querySelector(`.legend-info-btn[data-layerkey="${key}"]`);

        if (toggleCheckbox && toggleCheckbox.checked) {
            refreshCesiumWMSLayer(key, true);
            if (config.legend && legendInfoButton) {
                legendInfoButton.style.display = 'inline-block';
            }
        } else {
             if (config.legend && legendInfoButton) {
                legendInfoButton.style.display = 'none';
            }
        }
    }
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

    if (cesiumLayersConfig.departamento) {
        const cqlDep = depSelected ? `${cesiumLayersConfig.departamento.filterField} = '${depSelected}'` : "INCLUDE";
        const chkDep = document.getElementById(cesiumLayersConfig.departamento.toggleId);
        refreshCesiumWMSLayer('departamento', chkDep ? chkDep.checked : false, cqlDep);
    }
    if (cesiumLayersConfig.municipios) {
        let cqlMun = "INCLUDE";
        if (depSelected) {
            cqlMun = `adm1_es = '${depSelected}'`; 
            if (munSelected) cqlMun += ` AND ${cesiumLayersConfig.municipios.filterField} = '${munSelected}'`;
        }
        const chkMun = document.getElementById(cesiumLayersConfig.municipios.toggleId);
        refreshCesiumWMSLayer('municipios', chkMun ? chkMun.checked : false, cqlMun);
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
        const chkDis = document.getElementById(cesiumLayersConfig.distrito.toggleId);
        refreshCesiumWMSLayer('distrito', chkDis ? chkDis.checked : false, cqlDis);
    }
    if (cesiumLayersConfig.deburga) {
        const cqlDeb = debSelected ? `${cesiumLayersConfig.deburga.filterField} = '${debSelected}'` : "INCLUDE";
        const chkDeb = document.getElementById(cesiumLayersConfig.deburga.toggleId);
        refreshCesiumWMSLayer('deburga', chkDeb ? chkDeb.checked : false, cqlDeb);
        // Si la leyenda de deburga está abierta, podríamos forzar su recarga aquí,
        // pero como GetLegendGraphic no toma CQL_FILTER, no debería cambiar.
        // const legendContentDiv = document.getElementById(`legend-content-deburga`);
        // if (chkDeb && chkDeb.checked && legendContentDiv && legendContentDiv.style.display === 'block') {
        //    displayIndividualLayerLegend('deburga');
        // }
    }
}

function resetAllFilters() {
    if (departamentoSelectGlobal) departamentoSelectGlobal.value = "";
    populateMunicipioSelect(""); 
    if (deburgaSelectGlobal) deburgaSelectGlobal.value = "";

    ['departamento', 'municipios', 'distrito', 'deburga'].forEach(key => {
        if (cesiumLayersConfig[key]) {
            const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
            refreshCesiumWMSLayer(key, chk ? chk.checked : false, "INCLUDE");
        }
    });
    
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-89.2182, 13.6929, 400000),
        orientation: { heading: Cesium.Math.toRadians(0.0), pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
    });
}

let activeRasterLayerKey = null;
const thematicRasterKeys = ['temperatura', 'vegetacion', 'suelos'];

function manejarActivacionRaster(changedLayerKey, isChecked) {
    const superficieChk = document.getElementById(cesiumLayersConfig.superficie.toggleId);

    if (changedLayerKey && thematicRasterKeys.includes(changedLayerKey)) {
        if (isChecked) {
            thematicRasterKeys.forEach(key => {
                if (key !== changedLayerKey) {
                    const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
                    if (chk && chk.checked) {
                        chk.checked = false;
                        refreshCesiumWMSLayer(key, false);
                        const legendBtn = document.querySelector(`.legend-info-btn[data-layerkey="${key}"]`);
                        const legendDiv = document.getElementById(`legend-content-${key}`);
                        if (legendBtn) legendBtn.style.display = 'none';
                        if (legendDiv) {
                            legendDiv.style.display = 'none';
                            legendDiv.innerHTML = ''; // Limpiar
                        }
                        if (legendBtn) legendBtn.classList.remove('active');
                    }
                }
            });
            activeRasterLayerKey = changedLayerKey;
            if (superficieChk && !superficieChk.checked) {
                superficieChk.checked = true;
                refreshCesiumWMSLayer('superficie', true);
            }
        } else {
            if (activeRasterLayerKey === changedLayerKey) {
                activeRasterLayerKey = null;
                const algunaOtraTematicaActiva = thematicRasterKeys.some(key => {
                    const chk = document.getElementById(cesiumLayersConfig[key].toggleId);
                    return chk && chk.checked;
                });
                if (!algunaOtraTematicaActiva && superficieChk && superficieChk.checked) {
                    superficieChk.checked = false;
                    refreshCesiumWMSLayer('superficie', false);
                }
            }
        }
    } else if (changedLayerKey === 'superficie') {
        if (!isChecked && activeRasterLayerKey) {
            if (superficieChk) superficieChk.checked = true; // Forzar a que siga activa
            alert("La capa 'Superficie' es necesaria mientras una capa ráster temática (Temperatura, Vegetación, Uso de Suelo) esté activa.");
        }
    }
}

document.addEventListener('DOMContentLoaded', initializeCesiumApp);