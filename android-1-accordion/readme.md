Develop a custom re-usable Android `View` named `com.mobihacker.views.Accordion` that mimics the behaviour shown in accordion.mp4 screen cast (content appears when the user taps on the title).

The view class must have the following signature for the constructor: 

```Java
class Accordion extends ... {
	public Accordion(Context context, JSONArray items) {

	}
}
```

Retrieve the `JSONArray` from the `accordion.json` file in the assets directory.

This `View` will be used like this:

```Java
class Home extends Activity { 
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		.
		.
		Accordion accordion = new Accordion(getContext(), items);
		addView(accordion, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
		.
		.
	}	
		
}
```
